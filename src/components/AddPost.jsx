import {YStack, H3, Card, TextArea, Button, Spinner} from "tamagui";
import { useForm, Controller } from "react-hook-form";
import {useState} from "react";
import { ImagePlus, Trash } from '@tamagui/lucide-icons'
import {FlatList, TouchableOpacity, Image, View} from "react-native";
import constants from "../constants";
import * as ImagePicker from 'expo-image-picker';
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {useDispatch, useSelector} from "react-redux";
import {addPost} from "../features/posts/postsSlice";

export default function AddPost() {
    const dispatch = useDispatch();
    const {currentUser} = useSelector(store => store.user);
    const {savingPost} = useSelector(store => store.posts);
    const { control, handleSubmit, formState: {}, reset } = useForm({
        defaultValues: {
            caption: ""
        }
    });

    const [images, setImages] = useState([]);

    const removeImage = (uri) => {
        setImages(images.filter(image => image !== uri));
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: false,
            quality: 1,
            allowsEditing: true,
        });
        if (!result.cancelled) {
            const uri = result.assets[0].uri;
            setImages([...images, uri]);
        }
    };

    const onSubmit = async (data) => {
        reset();
        dispatch(addPost({
            caption: data.caption,
            images: images,
            currentUser: currentUser
        }));
        setImages([]);
    };

    if (savingPost) {
        return (
            <YStack width={"100vw"} height={"100vh"} justifyContent={"center"} alignItems={"center"}>
                <Spinner/>
                <H3>Posting...</H3>
            </YStack>
        );
    }
    return (
        <KeyboardAwareScrollView
            style={{ flex: 1 }}
            resetScrollToCoords={{ x: 0, y: 0 }}
            contentContainerStyle={{ flexGrow: 1 }}
            scrollEnabled={false}
            enableOnAndroid={true}
        >
            <YStack alignItems="center" justifyContent="center" height={"100%"}>
                <Card unstyled={false} maxWidth={600} width="90%" padding={20} alignItems="center">
                    <YStack gap={4} width={"100%"}>
                        <H3 textAlign={"center"}>New Post</H3>
                        <Controller
                            control={control}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextArea
                                    width={"100%"}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    placeholder="Type your post caption"
                                />
                            )}
                            name="caption"
                        />

                        <FlatList
                            data={images}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item }) => (
                                <View style={{ position: 'relative', margin: 10 }}>
                                    <Image
                                        resizeMode="cover"
                                        source={{ uri: item }}
                                        style={{
                                            width: 60,
                                            height: 60,
                                        }}
                                    />
                                    <TouchableOpacity style={{
                                        position: 'absolute',
                                        top: -10,
                                        left: -10,
                                        backgroundColor: 'white',
                                        borderRadius: 12,
                                        padding: 2,
                                    }} onPress={() => removeImage(item)}>
                                        <Trash width={24} height={24} color={"red"} fill='red' />
                                    </TouchableOpacity>
                                </View>
                            )}
                            horizontal={true}
                            showsHorizontalScrollIndicator={true}
                            contentContainerStyle={{ alignItems: 'center'}}
                        />
                        <Button icon={ImagePlus} onPress={pickImage}>Media</Button>
                        <Button color={constants.colours.secondary} backgroundColor={constants.colours.primary} onPress={handleSubmit(onSubmit)}>Post</Button>
                    </YStack>
                </Card>
            </YStack>
        </KeyboardAwareScrollView>
    )
}
