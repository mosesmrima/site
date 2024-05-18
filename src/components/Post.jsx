import React, { useRef, useState, useEffect } from 'react';
import { YStack, Avatar, XStack, SizableText, Paragraph, Input, Button, Accordion, Square, ScrollView } from "tamagui";
import { FontAwesome } from '@expo/vector-icons';
import constants from "../constants";
import { Image, TouchableOpacity, StyleSheet } from "react-native";
import { SwiperFlatList } from 'react-native-swiper-flatlist';
import { useSelector } from "react-redux";
import { likePost, unlikePost, checkIfLiked } from "../utils/likeUtils";
import { addComment, getComments } from "../utils/commentUtils";
import defaultProfile from "../../assets/defaultAvatar.png";

export default function Post({ post }) {
    const carouselRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(post.likes ? post.likes.length : 0);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const currentUser = useSelector(store => store.user.currentUser);

    useEffect(() => {
        const fetchLikeStatus = async () => {
            if (currentUser) {
                const liked = await checkIfLiked(currentUser.uid, post.owner.uid, post.id);
                setIsLiked(liked);
            }
        };

        const fetchComments = async () => {
            const commentsData = await getComments(post.owner.uid, post.id);
            setComments(commentsData);
        };

        fetchLikeStatus();
        fetchComments();
    }, [currentUser, post.owner.uid, post.id]);

    const handleLike = async () => {
        setIsLiked(!isLiked);
        if (isLiked) {
            setLikesCount(likesCount - 1);
            await unlikePost(currentUser.uid, post.owner.uid, post.id);
        } else {
            setLikesCount(likesCount + 1);
            await likePost(currentUser.uid, post.owner.uid, post.id);
        }
    };

    const handleAddComment = async () => {
        if (newComment.trim() !== "") {
            await addComment(post.owner.uid, post.id, newComment);
            setNewComment("");
            const commentsData = await getComments(post.owner.uid, post.id);
            setComments(commentsData);
        }
    };

    const handleNext = () => {
        const nextIndex = currentIndex + 1 >= post.images.length ? 0 : currentIndex + 1;
        carouselRef.current?.scrollToIndex({ index: nextIndex });
        setCurrentIndex(nextIndex);
    };

    const handlePrev = () => {
        const prevIndex = currentIndex - 1 < 0 ? post.images.length - 1 : currentIndex - 1;
        carouselRef.current?.scrollToIndex({ index: prevIndex });
        setCurrentIndex(prevIndex);
    };

    return (
        <YStack gap={2} borderRadius={20} backgroundColor={constants.colours.secondary} maxWidth={350} padding={15}>
            <XStack justifyContent={"space-between"} alignItems={"center"}>
                <XStack gap={"$2"} alignItems="center">
                    <Avatar circular size="$3">
                        <Avatar.Image
                            accessibilityLabel="User Avatar"
                            src={post.owner.profilePic ? post.owner.profilePic : defaultProfile}
                        />
                        <Avatar.Fallback delayMs={600} backgroundColor="$blue10" />
                    </Avatar>
                    <SizableText fontWeight={"900"}>{`${post.owner.firstName} ${post.owner.lastName}`}</SizableText>
                </XStack>
                <FontAwesome name="ellipsis-h" size={20} color="black" />
            </XStack>
            <Paragraph>
                {post.caption}
            </Paragraph>
            {post.images.length > 0 ? (
                <>
                    <SwiperFlatList
                        ref={carouselRef}
                        autoplay
                        autoplayDelay={5}
                        autoplayLoop
                        index={currentIndex}
                        onChangeIndex={({ index }) => setCurrentIndex(index)}
                        showPagination
                        data={post.images}
                        renderItem={({ item }) => (
                            <Image
                                source={{ uri: item }}
                                style={styles.image}
                                resizeMode="cover"
                            />
                        )}
                        paginationStyleItem={styles.paginationStyleItem}
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
            ) : <YStack width={400} />}
            <XStack width={"30%"} justifyContent={"space-between"} gap={"$4"} alignItems={"center"}>
                <TouchableOpacity onPress={handleLike}>
                    <FontAwesome name={isLiked ? "heart" : "heart-o"} size={18} color={constants.colours.primary} />
                </TouchableOpacity>
                <FontAwesome name="share-alt" size={18} color={constants.colours.primary} />
            </XStack>
            <SizableText fontWeight={"700"}>{likesCount} likes</SizableText>

            {/* Comments Accordion */}
            <Accordion overflow="hidden" width="100%" type="multiple">
                <Accordion.Item value="comments">
                    <Accordion.Trigger focusStyle={{ backgroundColor: "transparent" }} borderColor={"transparent"} backgroundColor={"transparent"} style={false} flexDirection="row" justifyContent="space-between">
                        {({ open }) => (
                            <>
                                <SizableText color={constants.colours.primary}>View all comments</SizableText>
                                <XStack animation="quick" rotate={open ? '180deg' : '0deg'}>
                                    <FontAwesome name={"chevron-down"} size="$1" />
                                </XStack>
                            </>
                        )}
                    </Accordion.Trigger>
                    <Accordion.HeightAnimator animation="medium">
                        <Accordion.Content backgroundColor={"transparent"} animation="medium" exitStyle={{ opacity: 0 }}>
                            <ScrollView  width={"400px"} maxHeight={200}>
                                <YStack gap={"$2"}>
                                    {comments.map((comment, index) => (
                                        <YStack key={index} gap={"$1"} alignItems="center">
                                            <XStack>
                                                <Avatar circular size="$1">
                                                    <Avatar.Image
                                                        accessibilityLabel="Commenter Avatar"
                                                        src={comment.profilePic || defaultProfile}
                                                    />
                                                    <Avatar.Fallback delayMs={600} backgroundColor="$blue10" />
                                                </Avatar>
                                                <SizableText fontWeight={"700"}>{comment.userName}</SizableText>
                                            </XStack>
                                            <Paragraph>{comment.text}</Paragraph>
                                        </YStack>
                                    ))}
                                </YStack>
                            </ScrollView>
                        </Accordion.Content>
                    </Accordion.HeightAnimator>
                </Accordion.Item>
            </Accordion>

            {/* Add Comment */}
            <XStack gap={"$2"} alignItems="center">
                <Input
                    value={newComment}
                    onChangeText={setNewComment}
                    placeholder="Add a comment..."
                    width="80%"
                />
                <Button onPress={handleAddComment}>Post</Button>
            </XStack>
        </YStack>
    );
}

const styles = StyleSheet.create({
    image: {
        width: 350,
        height: 200,
    },
    paginationStyleItem: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
});
