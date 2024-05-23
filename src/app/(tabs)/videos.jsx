import React, { useState, useRef, useEffect } from 'react';
import { View, Dimensions, FlatList, StyleSheet, Pressable } from 'react-native';
import { Video, ResizeMode } from 'expo-av';

const { width, height } = Dimensions.get('window');

const videos = [
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
];

const VideoCarousel = () => {
    const [currentViewableItemIndex, setCurrentViewableItemIndex] = useState(0);
    const viewabilityConfig = { viewAreaCoveragePercentThreshold: 50 };

    const onViewableItemsChanged = ({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setCurrentViewableItemIndex(viewableItems[0].index ?? 0);
        }
    };

    const viewabilityConfigCallbackPairs = useRef([{ viewabilityConfig, onViewableItemsChanged }]);

    return (
        <View style={styles.container}>
            <FlatList
                data={videos}
                renderItem={({ item, index }) => (
                    <Item item={item} shouldPlay={index === currentViewableItemIndex} />
                )}
                keyExtractor={(item) => item}
                pagingEnabled
                horizontal={false}
                showsVerticalScrollIndicator={false}
                viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
            />
        </View>
    );
};

const Item = ({ item, shouldPlay }) => {
    const video = useRef(null);
    const [status, setStatus] = useState(null);

    useEffect(() => {
        if (!video.current) return;

        const playVideo = async () => {
            if (shouldPlay) {
                try {
                    await video.current.playAsync();
                } catch (error) {
                    console.log('Play error:', error);
                }
            } else {
                try {
                    await video.current.pauseAsync();
                    await video.current.setPositionAsync(0);
                } catch (error) {
                    console.log('Pause error:', error);
                }
            }
        };

        playVideo();
    }, [shouldPlay]);

    return (
        <Pressable onPress={() => status?.isPlaying ? video.current.pauseAsync() : video.current.playAsync()}>
            <View style={styles.videoContainer}>
                <Video
                    ref={video}
                    source={{ uri: item }}
                    style={styles.video}
                    isLooping
                    resizeMode={ResizeMode.COVER}
                    useNativeControls={false}
                    onPlaybackStatusUpdate={(status) => setStatus(status)}
                />
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    videoContainer: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
    video: {
        width: '100%',
        height: '100%',
    },
});

export default VideoCarousel;
