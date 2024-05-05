import {ScrollView, YStack} from 'tamagui'
import Post from "../../components/Post";


export default function Tab() {
    return (
        <ScrollView>
            <YStack padding={"$6"} gap={"$4"} alignItems="center">
                <Post/>
                <Post/>
                <Post/>
                <Post/>
            </YStack>
        </ScrollView>
    );
}
