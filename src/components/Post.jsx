import React, { useRef, useState } from 'react';
import {YStack, Avatar, XStack, SizableText, Paragraph} from "tamagui";
import { FontAwesome } from '@expo/vector-icons';
import constants from "../constants";
import { Image } from "react-native";
import Carousel from "react-native-reanimated-carousel";

export default function Post({post}) {

    const carouselRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    return (
        <YStack gap={2} borderRadius={20} backgroundColor={constants.colours.secondary} maxWidth={500} padding={15}>
            <XStack justifyContent={"space-between"} alignItems={"center"}>
                <XStack gap={"$2"} alignItems="center">
                    <Avatar circular size="$3">
                        <Avatar.Image
                            accessibilityLabel="Nate Wienert"
                            src="https://images.unsplash.com/photo-1531384441138-2736e62e0919?&w=100&h=100&dpr=2&q=80"
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
            {
                post.images.length > 0?   (
                    <>
                        <Carousel
                            ref={carouselRef}
                            loop
                            width={400}
                            height={200}
                            data={post.images}
                            scrollAnimationDuration={1000}
                            renderItem={({ item }) => (
                                <Image
                                    source={{ uri: item }}
                                    style={{ width: '100%', height: '100%' }}
                                    resizeMode="cover"
                                />
                            )}
                            onSnapToItem={(index) => setCurrentIndex(index)}
                        />
                        <XStack width={"100%"} justifyContent={"space-between"} alignItems={"center"}>
                            <FontAwesome.Button name="angle-left" backgroundColor="transparent" onPress={() => carouselRef.current?.prev(1)} />
                            <FontAwesome.Button name="angle-right" backgroundColor="transparent" onPress={() => carouselRef.current?.scrollTo(1)} />
                        </XStack>
                    </>
                ): <YStack width={400}/>
            }
            <XStack width={"30%"} justifyContent={"space-between"} gap={"$4"} alignItems={"center"}>
                <FontAwesome name="heart-o" size={18} color={constants.colours.primary} />
                <FontAwesome name="comment" size={18} color={constants.colours.primary} />
                <FontAwesome name="share-alt" size={18} color={constants.colours.primary} />
            </XStack>
            <SizableText fontWeight={"700"}>1200 likes</SizableText>
            <SizableText color={constants.colours.primary}>View all comments</SizableText>
        </YStack>
    );
}
