import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Dimensions, FlatList, StyleSheet, Pressable } from 'react-native';
import { Video, ResizeMode } from 'expo-av';

const { width, height } = Dimensions.get('window');
//this works
const videos = [
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
];

const VideoCarousel = () => {
    const [currentViewableItemIndex, setCurrentViewableItemIndex] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRefs = useRef([]);

    const viewabilityConfig = { viewAreaCoveragePercentThreshold: 80 };

    const onViewableItemsChanged = ({ viewableItems }) => {
        if (viewableItems.length > 0) {
            const newIndex = viewableItems[0].index ?? 0;
            setCurrentViewableItemIndex(newIndex);
        } else {
            setCurrentViewableItemIndex(null);
        }
    };

    const viewabilityConfigCallbackPairs = useRef([{ viewabilityConfig, onViewableItemsChanged }]);

    const playOrPauseVideo = useCallback((index) => {
        if (videoRefs.current[index]) {
            if (isPlaying) {
                videoRefs.current[index].pauseAsync().catch((error) => console.log('Pause error:', error));
            } else {
                videoRefs.current[index].playAsync().catch((error) => console.log('Play error:', error));
            }
            setIsPlaying(!isPlaying);
        }
    }, [isPlaying]);

    useEffect(() => {
        videoRefs.current.forEach((ref, i) => {
            if (ref) {
                if (i === currentViewableItemIndex) {
                    ref.playAsync().catch((error) => console.log('Play error:', error));
                } else {
                    ref.pauseAsync().catch((error) => console.log('Pause error:', error));
                }
            }
        });
    }, [currentViewableItemIndex]);

    const renderItem = ({ item, index }) => (
        <Pressable onPress={() => playOrPauseVideo(index)}>
            <View style={styles.videoContainer}>
                <Video
                    ref={(ref) => (videoRefs.current[index] = ref)}
                    source={{ uri: item }}
                    style={styles.video}
                    isLooping
                    resizeMode={ResizeMode.COVER}
                    useNativeControls={false}
                />
            </View>
        </Pressable>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={videos}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                pagingEnabled
                horizontal={false}
                showsVerticalScrollIndicator={false}
                viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    videoContainer: {
        width,
        height,
    },
    video: {
        width: '100%',
        height: '100%',
    },
});

export default VideoCarousel;
