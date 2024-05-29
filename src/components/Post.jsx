import React, { useRef, useState, useEffect, memo, useCallback } from 'react';
import { YStack, Avatar, XStack, SizableText, Paragraph, Input, Button, Accordion, ScrollView, Text } from "tamagui";
import { FontAwesome } from '@expo/vector-icons';
import constants from "../constants";
import { TouchableOpacity, StyleSheet } from "react-native";
import { SwiperFlatList } from 'react-native-swiper-flatlist';
import { useDispatch, useSelector } from "react-redux";
import { likePost, unlikePost, checkIfLiked } from "../utils/likeUtils";
import { addComment, getComments } from "../utils/commentUtils";
import defaultProfile from "../../assets/defaultAvatar.png";
import { router } from "expo-router";
import { deletePost } from "../features/posts/postsSlice";
import { Image } from 'expo-image';

const Post = ({ post }) => {
    const carouselRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(post.likes ? post.likes.length : 0);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const currentUser = useSelector(store => store.user.currentUser);
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchLikeStatus = async () => {
            if (currentUser && post.id) {
                const liked = await checkIfLiked(currentUser.uid, post.owner.uid, post.id);
                setIsLiked(liked);
            } else {
                console.warn("Skipping fetchLikeStatus: currentUser or post.id is undefined or null");
            }
        };

        const fetchComments = async () => {
            if (post.id) {
                const commentsData = await getComments(post.owner.uid, post.id);
                setComments(commentsData);
            } else {
                console.warn("Skipping fetchComments: post.id is undefined or null");
            }
        };

        fetchLikeStatus();
        fetchComments();

    }, []);

    const handleLike = useCallback(async () => {
        if (currentUser && post.id) {
            setIsLiked(!isLiked);
            if (isLiked) {
                setLikesCount(likesCount - 1);
                await unlikePost(currentUser.uid, post.owner.uid, post.id);
            } else {
                setLikesCount(likesCount + 1);
                await likePost(currentUser.uid, post.owner.uid, post.id);
            }
        }
    }, [currentUser, isLiked, likesCount, post.id, post.owner.uid]);

    const handleAddComment = useCallback(async () => {
        if (newComment.trim() !== "" && post.id) {
            await addComment(post.owner.uid, post.id, newComment);
            setNewComment("");
            const commentsData = await getComments(post.owner.uid, post.id);
            setComments(commentsData);
        }
    }, [newComment, post.id, post.owner.uid]);

    const handleNext = useCallback(() => {
        const nextIndex = currentIndex + 1 >= post.images.length ? 0 : currentIndex + 1;
        carouselRef.current?.scrollToIndex({ index: nextIndex });
        setCurrentIndex(nextIndex);
    }, [currentIndex, post.images.length]);

    const handlePrev = useCallback(() => {
        const prevIndex = currentIndex - 1 < 0 ? post.images.length - 1 : currentIndex - 1;
        carouselRef.current?.scrollToIndex({ index: prevIndex });
        setCurrentIndex(prevIndex);
    }, [currentIndex, post.images.length]);

    return (
        <YStack gap={2} borderRadius={10} backgroundColor={constants.colours.secondary} maxWidth={350} padding={10}>
            <XStack justifyContent={"space-between"} alignItems={"center"}>
                <TouchableOpacity onPress={() => router.push(`/users/${post.owner.uid}`)}>
                    <XStack gap={2} alignItems="center">
                        <Avatar circular size={"$3"}>
                            <Avatar.Image
                                accessibilityLabel="User Avatar"
                                src={post.owner.profilePic ? post.owner.profilePic : defaultProfile}
                            />
                            <Avatar.Fallback delayMs={600} backgroundColor="$blue10" />
                        </Avatar>
                        <Text fontWeight={"bold"}>{`${post.owner.firstName} ${post.owner.lastName}`}</Text>
                    </XStack>
                </TouchableOpacity>
                {currentUser.uid === post.owner.uid && (
                    <TouchableOpacity onPress={() => dispatch(deletePost({ postId: post.id, uid: post.owner.uid }))}>
                        <FontAwesome name="trash" size={15} color="red" />
                    </TouchableOpacity>
                )}
            </XStack>
            <Paragraph>{post.caption}</Paragraph>
            {post.images.length > 0 && (
                <>
                    <SwiperFlatList
                        ref={carouselRef}
                        index={currentIndex}
                        horizontal={true}
                        onChangeIndex={({ index }) => setCurrentIndex(index)}
                        data={post.images}
                        style={{ maxHeight: 200, maxWidth: 300}}
                        renderItem={({ item }) => (
                            <Image
                                source={{ uri: item }}
                                style={styles.image}
                                contentFit="cover"
                            />
                        )}
                    />
                    {post.images.length > 1 && (
                        <XStack width={"100%"} justifyContent={"space-between"} alignItems={"center"}>
                            <TouchableOpacity onPress={handlePrev}>
                                <FontAwesome name="angle-left" size={30} color={constants.colours.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleNext}>
                                <FontAwesome name="angle-right" size={30} color={constants.colours.primary} />
                            </TouchableOpacity>
                        </XStack>
                    )}
                </>
            )}
            <XStack width={"30%"} justifyContent={"space-between"} gap={4} alignItems={"center"}>
                <TouchableOpacity onPress={handleLike}>
                    <FontAwesome name={isLiked ? "heart" : "heart-o"} size={18} color={constants.colours.primary} />
                </TouchableOpacity>
            </XStack>
            <SizableText>{likesCount} likes</SizableText>
            <Accordion overflow="hidden" width="100%" type="multiple">
                <Accordion.Item value="comments">
                    <Accordion.Trigger focusStyle={{ backgroundColor: "transparent" }} borderColor={"transparent"} backgroundColor={"transparent"} style={false} flexDirection="row" justifyContent="space-between">
                        {({ open }) => (
                            <>
                                <SizableText color={constants.colours.primary}>View all comments</SizableText>
                                <XStack animation="quick" rotate={open ? '180deg' : '0deg'}>
                                    <FontAwesome name={"chevron-down"} size={2} />
                                </XStack>
                            </>
                        )}
                    </Accordion.Trigger>
                    <Accordion.HeightAnimator animation="medium">
                        <Accordion.Content backgroundColor={"transparent"} animation="medium" exitStyle={{ opacity: 0 }}>
                            <ScrollView width={300} maxHeight={200}>
                                <YStack gap={2}>
                                    {comments.map((comment, index) => (
                                        <YStack key={index} gap={1} alignItems="center">
                                            <XStack width={300}>
                                                <Avatar circular size="$1">
                                                    <Avatar.Image
                                                        accessibilityLabel="Commenter Avatar"
                                                        src={comment.profilePic || defaultProfile}
                                                    />
                                                    <Avatar.Fallback delayMs={600} backgroundColor="$blue10" />
                                                </Avatar>
                                                <SizableText width={"100%"} fontWeight={"bold"}>{comment.userName}</SizableText>
                                            </XStack>
                                            <Paragraph width={"100%"}>{comment.text}</Paragraph>
                                        </YStack>
                                    ))}
                                </YStack>
                            </ScrollView>
                        </Accordion.Content>
                    </Accordion.HeightAnimator>
                </Accordion.Item>
            </Accordion>
            <XStack gap={2} alignItems="center">
                <Input
                    value={newComment}
                    onChangeText={setNewComment}
                    placeholder="Add a comment..."
                />
                <Button onPress={handleAddComment}>Post</Button>
            </XStack>
        </YStack>
    );
}

const styles = StyleSheet.create({
    image: {
        width: 280,
        height: 200,

    }
});

export default memo(Post);
