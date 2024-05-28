import {ScrollView, Spinner, YStack, View, Text} from 'tamagui'
import Post from "../../components/Post";
import {useDispatch, useSelector} from "react-redux";
import {useEffect} from "react";
import {getAllPosts} from "../../features/posts/postsSlice";
import SearchComponent from "../../components/SearchComponent";


export default function Tab() {
    const dispatch = useDispatch()
    const {allPostsLoading, allPosts, firebaseError} = useSelector(store => store.posts)

    useEffect(() => {
        dispatch(getAllPosts())
    }, [allPosts]);

    if (allPostsLoading) {
        return (
            <YStack flex={1} justifyContent={"center"} alignItems={"center"}>
                <Spinner/>
            </YStack>
        )
    }
if (firebaseError) {
    return <View flex={1} justifyContent={"center"} alignItems={"center"}>
        <Text>Firebase free tier exceeded try again after 24hrs </Text>
    </View>
} else {
    return (
        <View alignItems={"center"} gap={3} padding={12} flex={1} $gtSm={{
            flexDirection: "row",
            alignItems: "stretch"
        }} >
            <YStack padding={4} height={40} width={250}>
                <SearchComponent />
            </YStack>
            <ScrollView>
                <YStack padding={6} gap={4} alignItems="center">
                    {allPosts.map((el, index) => (
                        <Post key={index} post={el} />
                    ))}
                </YStack>
            </ScrollView>
        </View>
    );
}
}
