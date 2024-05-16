import {Avatar, Button, ScrollView, SizableText, XStack, YStack} from 'tamagui';
import {Platform} from "react-native";
import {StarRatingDisplay} from "react-native-star-rating-widget";
import { Edit3 } from '@tamagui/lucide-icons';
import constants from '../constants';
import {useDispatch, useSelector} from "react-redux";
import {useEffect, useState} from "react";
import {getOtherUserPosts, getUserPosts} from "../features/posts/postsSlice";
import Post from "./Post";


export default function UserProfile({uid}) {
    const {currentUser, otherUser} = useSelector(store => store.user)
    const {userPosts, otherUserPosts} = useSelector(store => store.posts)
    const dispatch = useDispatch()
    const [isCurrentUser, setIsCurrentUser] = useState(false)

    useEffect(() => {
        if (uid === currentUser.uid) {
            dispatch(getUserPosts())
            setIsCurrentUser(true)
        }
        else {
            dispatch(getOtherUserPosts(uid))
            setIsCurrentUser(false)
        }
    }, []);


    return (
        <ScrollView >
            <YStack justifyContent={"center"} alignItems={"center"} padding={2}>
                <YStack  width={`${Platform.OS==="web"? "85%": "95%"}`} borderRadius={20} backgroundColor={constants.colours.secondary} padding={"$4"} gap="$2">
                    <XStack justifyContent={"space-between"}>
                        <YStack alignItems={"center"} gap={"$2"}>
                            <SizableText color={constants.colours.primary} fontWeight={"700"}>
                                {
                                    isCurrentUser? `${currentUser.firstName} ${currentUser.lastName}` :
                                        `${otherUser.firstName} ${otherUser.lastName}`
                                }

                            </SizableText>
                            <Avatar circular size="$3">
                                <Avatar.Image
                                    accessibilityLabel="Nate Wienert"
                                    src="https://images.unsplash.com/photo-1531384441138-2736e62e0919?&w=100&h=100&dpr=2&q=80"
                                />
                                <Avatar.Fallback delayMs={600} backgroundColor="$blue10" />
                            </Avatar>
                        </YStack>
                        <YStack gap="$2">
                            <StarRatingDisplay starSize={20} color={constants.colours.primary} rating={4.5}/>
                            <Button color={constants.colours.secondary} backgroundColor={constants.colours.primary} borderRadius={40} size={"$2"}>Reviews</Button>
                        </YStack>
                    </XStack>
                    <YStack alignItems={"center"} alignSelf={"center"}>
                        <SizableText > 2 Followers 3 following 10 Posts</SizableText>
                        <SizableText fontWeight={"700"}> Nairobi Kenya</SizableText>
                        <SizableText> 0716138097 </SizableText>
                    </YStack>
                    <YStack gap={"$3"}>
                        <SizableText size={"$5"} fontWeight={"600"}>Interior Designer</SizableText>
                        <SizableText maxWidth={`${Platform.OS==="web"? "50%": "95%"}`}>
                            Hello, I am John, a professional interior designer with over 4 years of experience. I have a keen
                            eye for details.
                        </SizableText>
                        {
                            isCurrentUser?  <Button color={constants.colours.secondary} backgroundColor={constants.colours.primary}  width={"$11"} borderRadius={40} size={"$3"} iconAfter={Edit3}>Edit Profile</Button> :
                                <Button color={constants.colours.secondary} backgroundColor={constants.colours.primary}  width={"$11"} borderRadius={40} size={"$3"}>Follow</Button>
                        }
                    </YStack>
                </YStack>
                <SizableText alignSelf={'center'} size={"$5"} fontWeight={"600"}>My Posts</SizableText>
                <YStack padding={"$6"} gap={"$4"} alignItems="center">
                    {
                        isCurrentUser?
                            userPosts.map((el, index) => <Post key={index} post={el}/>):
                            otherUserPosts.map((el, index) => <Post key={index} post={el}/>)
                    }
                </YStack>
            </YStack>
        </ScrollView>
    )
}
