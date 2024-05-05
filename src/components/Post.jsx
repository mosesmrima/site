import {YStack, Avatar, XStack, SizableText, Paragraph} from "tamagui";
import { FontAwesome } from '@expo/vector-icons';
import constants from "../constants";
import {Platform} from "react-native";

export default function Post() {
   return (
       <YStack gap={2} borderRadius={20}  backgroundColor={constants.colours.secondary} width={`${Platform.OS === "web"? "80%": "100%"}`} padding={15}>
           <XStack justifyContent={"space-between"} alignItems={"center"}>
               <XStack gap={"$2"} alignItems="center">
                   <Avatar circular size="$3">
                       <Avatar.Image
                           accessibilityLabel="Nate Wienert"
                           src="https://images.unsplash.com/photo-1531384441138-2736e62e0919?&w=100&h=100&dpr=2&q=80"
                       />
                       <Avatar.Fallback delayMs={600} backgroundColor="$blue10" />
                   </Avatar>
                   <SizableText fontWeight={"900"}>John Doe</SizableText>
               </XStack>
               <FontAwesome name="ellipsis-h" size={20} color="black" />
           </XStack>
           <Paragraph>
               Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
           </Paragraph>
           <XStack  width={"30%"} justifyContent={"space-between"} gap={"$4"} alignItems={"center"}>
               <FontAwesome name="heart-o" size={18} color={constants.colours.primary} />
               <FontAwesome name="comment" size={18} color={constants.colours.primary} />
               <FontAwesome name="share-alt" size={18} color={constants.colours.primary} />
           </XStack >
           <SizableText fontWeight={"700"}>1200 likes</SizableText>
           <SizableText color={constants.colours.primary}>View all comments</SizableText>
       </YStack>
   );
}