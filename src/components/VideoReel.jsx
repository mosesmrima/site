import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator, Text, Modal, TouchableOpacity, FlatList, Image } from 'react-native';
import { Button, Input, XStack, YStack } from "tamagui";
import { Video } from 'expo-av';
import GestureRecognizer from 'react-native-swipe-gestures';
import { MaterialIcons } from '@expo/vector-icons';
import { auth, storage, db } from "../../firebaseConfig";
import { serverTimestamp, collection, getDocs, addDoc } from "firebase/firestore";
import { useSelector } from "react-redux";
import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';

const { height } = Dimensions.get('window');

const VideoReel = () => {
    const { currentUser } = useSelector(store => store.user);
    const [videos, setVideos] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [caption, setCaption] = useState('');
    const [selectedVideos, setSelectedVideos] = useState([]);
    const [thumbnails, setThumbnails] = useState({});

    useEffect(() => {
        const fetchVideos = async () => {
            const videoList = [];
            const snapshot = await getDocs(collection(db, 'videos'));
            snapshot.forEach(doc => videoList.push(doc.data()));
            setVideos(videoList);
            setLoading(false);
        };
        fetchVideos();
    }, []);

    const onSwipeUp = () => {
        if (currentIndex < videos.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const onSwipeDown = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const uploadVideo = async () => {
        for (const videoUri of selectedVideos) {
            const response = await fetch(videoUri);
            const blob = await response.blob();
            const storageRef = storage.ref().child(`videos/${Date.now()}`);
            const snapshot = await storageRef.put(blob);
            const videoURL = await snapshot.ref.getDownloadURL();

            const videoData = {
                caption,
                video: videoURL,
                timeStamp: serverTimestamp(),
                owner: {
                    ...currentUser,
                    uid: auth.currentUser.uid
                }
            };

            await addDoc(collection(db, 'videos'), videoData);
        }

        setCaption('');
        setSelectedVideos([]);
        setThumbnails({});
        setModalVisible(false);
        setLoading(true);
        fetchVideos();
    };

    const selectVideo = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            const videoUri = result.assets[0].uri;
            setSelectedVideos([...selectedVideos, videoUri]);

            try {
                const { uri: thumbnailUri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
                    time: 1000,
                });
                setThumbnails(prevThumbnails => ({
                    ...prevThumbnails,
                    [videoUri]: thumbnailUri,
                }));
            } catch (e) {
                console.warn(e);
            }
        }
    };

    const removeVideo = (uri) => {
        setSelectedVideos(selectedVideos.filter(video => video !== uri));
        setThumbnails(prevThumbnails => {
            const newThumbnails = { ...prevThumbnails };
            delete newThumbnails[uri];
            return newThumbnails;
        });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.uploadButton} onPress={() => setModalVisible(true)}>
                <MaterialIcons name="cloud-upload" size={32} color="white" />
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
            >
                <View style={styles.modalView}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Upload Video</Text>
                        <Input
                            style={styles.input}
                            placeholder="Caption"
                            value={caption}
                            onChangeText={setCaption}
                        />
                        <FlatList
                            data={selectedVideos}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item }) => (
                                <View style={styles.videoContainer}>
                                    {thumbnails[item] ? (
                                        <Image
                                            source={{ uri: thumbnails[item] }}
                                            style={styles.videoPreview}
                                        />
                                    ) : (
                                        <Video
                                            source={{ uri: item }}
                                            style={styles.videoPreview}
                                            resizeMode="cover"
                                            shouldPlay={false}
                                        />
                                    )}
                                    <TouchableOpacity style={styles.removeIcon} onPress={() => removeVideo(item)}>
                                        <MaterialIcons name="close" size={24} color="red" />
                                    </TouchableOpacity>
                                </View>
                            )}
                            horizontal={true}
                            showsHorizontalScrollIndicator={true}
                            contentContainerStyle={{ alignItems: 'center' }}
                        />
                        <YStack alignItems={"center"} gap={"$4"}>
                            <XStack gap={"$4"} justifyContent={"space-between"}>
                                <Button themeInverse size={"$3"} onPress={selectVideo}>Select Video</Button>
                                <Button themeInverse size={"$3"} onPress={uploadVideo}>Upload</Button>
                            </XStack>
                            <Button width={"50%"} size={"$2"} onPress={() => setModalVisible(false)}>Cancel</Button>
                        </YStack>
                    </View>
                </View>
            </Modal>

            {videos.length > 0 && (
                <GestureRecognizer
                    onSwipeUp={onSwipeUp}
                    onSwipeDown={onSwipeDown}
                    style={styles.container}
                >
                    <Video
                        source={{ uri: videos[currentIndex]?.video }}
                        style={styles.video}
                        resizeMode="cover"
                        shouldPlay
                        isLooping
                        useNativeControls={false}
                    />
                </GestureRecognizer>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    video: {
        height: height,
        width: '100%',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    uploadButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        zIndex: 1,
    },
    modalView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: 400,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        marginBottom: 20,
    },
    input: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: 'gray',
        marginBottom: 20,
        borderRadius: 5,
    },
    videoContainer: {
        position: 'relative',
        margin: 10,
    },
    videoPreview: {
        width: 100,
        height: 100,
    },
    removeIcon: {
        position: 'absolute',
        top: -10,
        right: -10,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 2,
    },
    selectedText: {
        color: '#000',
        marginTop: 10,
        marginBottom: 20,
    },
});

export default VideoReel;
