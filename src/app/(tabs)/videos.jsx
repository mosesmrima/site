import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Dimensions, FlatList, StyleSheet, Pressable, TouchableOpacity, Text, Modal, ActivityIndicator, AppState } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { storage, db } from "../../../firebaseConfig";
import { useSelector } from "react-redux";
import { Input, Button, YStack } from "tamagui";
import { useFocusEffect, useIsFocused } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const VideoCarousel = () => {
    const [currentViewableItemIndex, setCurrentViewableItemIndex] = useState(null);
    const [videoData, setVideoData] = useState([]);
    const [caption, setCaption] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedVideoUri, setSelectedVideoUri] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const videoRefs = useRef([]);
    const { currentUser } = useSelector(store => store.user);
    const isFocused = useIsFocused();

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
            if (isFocused) {
                videoRefs.current[index].playAsync().catch((error) => console.log('Play error:', error));
            } else {
                videoRefs.current[index].pauseAsync().catch((error) => console.log('Pause error:', error));
            }
        }
    }, [isFocused]);

    useEffect(() => {
        videoRefs.current.forEach((ref, i) => {
            if (ref) {
                if (i === currentViewableItemIndex && isFocused) {
                    ref.playAsync().catch((error) => console.log('Play error:', error));
                } else {
                    ref.pauseAsync().catch((error) => console.log('Pause error:', error));
                }
            }
        });
    }, [currentViewableItemIndex, isFocused]);

    useEffect(() => {
        const fetchVideos = async () => {
            const querySnapshot = await getDocs(collection(db, "videos"));
            const videos = querySnapshot.docs.map(doc => doc.data());
            setVideoData(videos);
        };
        fetchVideos();
    }, []);

    useFocusEffect(
        useCallback(() => {
            videoRefs.current.forEach((ref) => {
                if (ref) {
                    ref.pauseAsync().catch((error) => console.log('Pause error:', error));
                }
            });

            return () => {
                videoRefs.current.forEach((ref) => {
                    if (ref) {
                        ref.pauseAsync().catch((error) => console.log('Pause error:', error));
                    }
                });
            };
        }, [])
    );

    useEffect(() => {
        const handleAppStateChange = (nextAppState) => {
            if (nextAppState === 'background' || nextAppState === 'inactive') {
                videoRefs.current.forEach((ref) => {
                    if (ref) {
                        ref.pauseAsync().catch((error) => console.log('Pause error:', error));
                    }
                });
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            subscription.remove();
        };
    }, []);

    const pickVideo = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.cancelled) {
            setSelectedVideoUri(result.assets[0].uri);
            setModalVisible(true);
        }
    };

    const uploadVideo = async () => {
        if (!selectedVideoUri || !caption.trim()) {
            return;
        }

        setIsUploading(true);
        try {
            const response = await fetch(selectedVideoUri);
            const blob = await response.blob();
            const filename = selectedVideoUri.substring(selectedVideoUri.lastIndexOf('/') + 1);
            const storageRef = ref(storage, `videos/${filename}`);
            await uploadBytes(storageRef, blob);
            const downloadURL = await getDownloadURL(storageRef);

            const videoDoc = {
                uri: downloadURL,
                owner: {
                    firstName: currentUser.firstName,
                    lastName: currentUser.lastName,
                },
                caption,
            };
            await addDoc(collection(db, "videos"), videoDoc);
            setVideoData([...videoData, videoDoc]);
        } catch (error) {
            console.log('Upload error:', error);
        }

        setSelectedVideoUri(null);
        setCaption('');
        setModalVisible(false);
        setIsUploading(false);
    };

    const renderItem = ({ item, index }) => (
        <View style={styles.videoItem}>
            <Pressable onPress={() => playOrPauseVideo(index)}>
                <View style={styles.videoContainer}>
                    <Video
                        ref={(ref) => (videoRefs.current[index] = ref)}
                        source={{ uri: item.uri }}
                        style={styles.video}
                        isLooping
                        resizeMode={ResizeMode.COVER}
                        useNativeControls={false}
                        onLoadStart={() => console.log('Loading video...')}
                        onLoad={() => console.log('Video loaded')}
                    />
                    <View style={styles.overlay}>
                        <Text style={styles.ownerText}>{item.owner.firstName} {item.owner.lastName}</Text>
                        <Text style={styles.captionText}>{item.caption}</Text>
                    </View>
                    <TouchableOpacity style={styles.uploadButton} onPress={pickVideo}>
                        <Ionicons name="cloud-upload-outline" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </Pressable>
        </View>
    );

    return (
        <View style={styles.container}>
            {videoData.length === 0 ? (
                <YStack flex={1} gap={4} justifyContent={"center"} alignItems={"center"}>
                    <Text style={styles.noVideosText}>No videos available, please upload</Text>
                    <TouchableOpacity onPress={pickVideo}>
                        <Ionicons name="cloud-upload-outline" size={20} color="blue" />
                    </TouchableOpacity>
                </YStack>

            ) : (
                <FlatList
                    data={videoData}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => index.toString()}
                    pagingEnabled
                    horizontal={false}
                    showsVerticalScrollIndicator={false}
                    viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
                />
            )}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
            >
                <View style={styles.modalView}>
                    <Input
                        style={styles.input}
                        placeholder="Enter caption"
                        value={caption}
                        onChangeText={setCaption}
                    />
                    <Button margin={"$2"} size={"$2"} onPress={uploadVideo}>Upload</Button>
                    <Button size={"$2"} onPress={() => setModalVisible(false)}>Cancel</Button>
                    {isUploading && <ActivityIndicator size="large" color="#0000ff" />}
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    videoItem: {
        marginBottom: 20,
    },
    videoContainer: {
        width,
        height: height * 0.9,
        position: 'relative',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    overlay: {
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 10,
    },
    ownerText: {
        fontWeight: 'bold',
        color: 'white',
    },
    captionText: {
        fontStyle: 'italic',
        color: 'white',
    },
    noVideosText: {
        textAlign: "center"
    },
    uploadButton: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: 10,
        borderRadius: 50,
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
        width: '100%',
    },
});

export default VideoCarousel;
