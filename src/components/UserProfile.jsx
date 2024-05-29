import { Avatar, Button, ScrollView, SizableText, XStack, YStack, Text } from 'tamagui';
import { Platform } from "react-native";
import { StarRatingDisplay } from "react-native-star-rating-widget";
import { Edit3 } from '@tamagui/lucide-icons';
import constants from '../constants';
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { getOtherUserPosts, getUserPosts } from "../features/posts/postsSlice";
import { getOtherUser } from "../features/user/userSlice";
import Post from "./Post";
import { followUser, unfollowUser, checkIfFollowing } from "../utils/followUtils";
import defaultProfile from "../../assets/defaultAvatar.png";
import { useRouter } from 'expo-router';

export default function UserProfile({ uid }) {
    const { currentUser, otherUser, otherUserIsLoading } = useSelector(store => store.user);
    const { userPosts, otherUserPosts } = useSelector(store => store.posts);
    const dispatch = useDispatch();
    const router = useRouter();
    const [isCurrentUser, setIsCurrentUser] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);

    useEffect(() => {
        if (currentUser && uid === currentUser.uid) {
            dispatch(getUserPosts());
            setIsCurrentUser(true);
        } else {
            dispatch(getOtherUserPosts(uid));
            dispatch(getOtherUser(uid));
            setIsCurrentUser(false);
            if (currentUser) {
                checkIfFollowing(currentUser.uid, uid).then(setIsFollowing);
            }
        }
    }, [uid]);

    const handleFollow = async () => {
        if (isFollowing) {
            await unfollowUser(currentUser.uid, uid);
        } else {
            await followUser(currentUser.uid, uid);
        }
        setIsFollowing(!isFollowing);
    };

    const handleChat = () => {
        const chatId = [currentUser.uid, uid].sort().join('_');
        router.push({
            pathname: `/chat/${chatId}`,
        });
    };

    if (otherUserIsLoading || !currentUser || (!isCurrentUser && !otherUser)) {
        return <SizableText>Loading...</SizableText>;
    }

    return (
        <ScrollView>
            <YStack justifyContent={"center"} alignItems={"center"} padding={2}>
                <YStack width={Platform.OS === "web" ? "85%" : "95%"} borderRadius={20} backgroundColor={constants.colours.secondary} padding={"$4"} gap="$2">
                    <XStack justifyContent={"space-between"}>
                        <YStack alignItems={"center"} gap={"$2"}>
                            <SizableText color={constants.colours.primary}>
                                {isCurrentUser ? `${currentUser.firstName} ${currentUser.lastName}` : `${otherUser.firstName} ${otherUser.lastName}`}
                            </SizableText>
                            <Avatar circular size="$3">
                                <Avatar.Image
                                    accessibilityLabel="User Profile Picture"
                                    src={isCurrentUser ?
                                        (currentUser.profilePic ? currentUser.profilePic : defaultProfile) :
                                        (otherUser.profilePic ? otherUser.profilePic : defaultProfile)
                                    }
                                />
                                <Avatar.Fallback delayMs={600} backgroundColor="$blue10" />
                            </Avatar>
                        </YStack>
                        <YStack gap="$2">
                            <StarRatingDisplay starSize={20} color={constants.colours.primary} rating={4.5} />
                            <Button color={constants.colours.secondary} backgroundColor={constants.colours.primary} borderRadius={40} size={"$2"}>Reviews</Button>
                        </YStack>
                    </XStack>
                    <YStack alignItems={"center"} alignSelf={"center"}>
                        <SizableText>
                            {isCurrentUser ? (currentUser.followers?.length || 0) : (otherUser.followers?.length || 0)} Followers {' '}
                            {isCurrentUser ? (currentUser.following?.length || 0) : (otherUser.following?.length || 0)} Following {' '}
                            {isCurrentUser ? userPosts.length : otherUserPosts.length} Posts
                        </SizableText>
                        <SizableText>
                            {isCurrentUser? currentUser.location: otherUser.location}
                        </SizableText>
                        <SizableText>
                            {isCurrentUser? currentUser.phone: otherUser.phone}
                        </SizableText>
                    </YStack>
                    <YStack gap={"$3"}>
                        {/*<SizableText size={"$5"}>Interior Designer</SizableText>*/}
                        <XStack maxWidth={Platform.OS === "web" ? "50%" : "95%"}>
                            <SizableText>
                                {isCurrentUser? currentUser.about: otherUser.about}
                            </SizableText>
                        </XStack>

                        {isCurrentUser ? (
                            <Button style={{opacity: 0}} color={constants.colours.secondary} backgroundColor={constants.colours.primary} borderRadius={40} width={150} size={"$2"} iconAfter={Edit3}>Edit Profile</Button>
                        ) : (
                            <>
                                <Button
                                    color={constants.colours.secondary}
                                    backgroundColor={constants.colours.primary}
                                    width={"$11"}
                                    borderRadius={40}
                                    size={"$3"}
                                    onPress={handleFollow}
                                >
                                    {isFollowing ? 'Unfollow' : 'Follow'}
                                </Button>
                                <Button
                                    color={constants.colours.secondary}
                                    backgroundColor={constants.colours.primary}
                                    width={"$11"}
                                    borderRadius={40}
                                    size={"$3"}
                                    onPress={handleChat}
                                >
                                    Chat With
                                </Button>
                            </>
                        )}
                    </YStack>
                </YStack>
                <SizableText alignSelf={'center'} size={"$5"}>My Posts</SizableText>
                <YStack padding={"$6"} gap={"$4"} alignItems="center">
                    {isCurrentUser ?
                        userPosts.map((el, index) => <Post key={index} post={el} />) :
                        otherUserPosts.map((el, index) => <Post key={index} post={el} />)
                    }
                </YStack>
            </YStack>
        </ScrollView>
    );
}
