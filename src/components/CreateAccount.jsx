import { YStack, SizableText, Button, Input, Card, XStack, Spinner, Text } from "tamagui";
import constants from "../constants";
import { Image } from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useForm, Controller } from "react-hook-form";
import React, { useState } from "react";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { signUp } from "../authService";
import { Link, router } from "expo-router";
import { getFirebaseAuthErrorMessage } from "../firebaseAuthErrorMessageHandler";
import { db, auth, storage } from "../../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { capitalizeFirstLetter } from "../utils/lib";
import * as ImagePicker from 'expo-image-picker';
import {getUser} from "../features/user/userSlice";
import {useDispatch} from "react-redux";

export default function CreateAccountPage() {
    const dispatch = useDispatch();
    const { control, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            passwordConfirm: "",
            profilePic: null,
            phone: "",
            location: "",
            about: ""
        }
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [passwordMismatch, setPasswordMismatch] = useState(false);

    const onSubmit = async data => {
        if (data.password !== data.passwordConfirm) {
            setPasswordMismatch(true);
        } else {
            setPasswordMismatch(false);
            setIsLoading(true);
            try {
                await signUp(data.email, data.password, data.firstName, data.lastName);

                let authInstance = await auth;
                authInstance.onAuthStateChanged(async user => {
                    if (user) {
                        try {
                            let profilePicUrl = null;
                            if (data.profilePic) {
                                profilePicUrl = await uploadImageAsync(data.profilePic);
                            }
                            await setDoc(doc(db, "users", authInstance.currentUser.uid), {
                                firstName: capitalizeFirstLetter(data.firstName),
                                lastName: capitalizeFirstLetter(data.lastName),
                                email: data.email.toLowerCase(),
                                uid: authInstance.currentUser.uid,
                                profilePic: profilePicUrl,
                                phone: data.phone,
                                location: data.location,
                                about: data.about,
                                followers: [],
                                following: []
                            });
                            await dispatch(getUser());
                            setIsLoading(false);
                            router.replace("/");
                        } catch (error) {
                            console.error('Error fetching user:', error);
                        }
                    }
                });
            } catch (err) {
                setIsLoading(false);
                console.log("Error:", err);
                if (err.code) {
                    const friendlyMessage = getFirebaseAuthErrorMessage(err.code);
                    console.log(friendlyMessage);
                }
            }
        }
    };

    const uploadImageAsync = async (imageUri) => {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const authInstance = await auth;
        const fileRef = ref(storage, `profilePics/${authInstance.currentUser.uid}/${new Date().getTime()}-${imageUri.split('/').pop()}`);
        await uploadBytes(fileRef, blob);
        return getDownloadURL(fileRef);
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const renderPasswordToggleIcon = (show) => (
        <Button
            onPress={show ? togglePasswordVisibility : togglePasswordVisibility}
            size="$2"
            icon={<MaterialCommunityIcons name={show ? 'eye-off' : 'eye'} size={24} color="grey" />}
            backgroundColor="transparent"
        />
    );

    const pickImage = async (onChange) => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            onChange(result.assets[0].uri);
        }
    };

    return (
        <KeyboardAwareScrollView
            style={{ flex: 1 }}
            resetScrollToCoords={{ x: 0, y: 0 }}
            contentContainerStyle={{ flexGrow: 1 }}
            scrollEnabled={true}
            enableOnAndroid={true}
        >
            <YStack alignItems="center" justifyContent="center" height="100%" width="100%">
                <Card unstyled={true} maxWidth={500} width="90%" padding={20} alignItems="center">
                    <YStack alignItems="center" width="100%" gap={4}>
                        <Text>Create Account</Text>


                        <Controller
                            control={control}
                            rules={{ required: 'First name is required' }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <Input
                                    placeholder="First Name"
                                    width="80%"
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    style={errors.firstName ? { borderColor: 'red' } : {}}
                                />
                            )}
                            name="firstName"
                        />
                        {errors.firstName && <SizableText style={{ color: 'red' }}>{errors.firstName.message}</SizableText>}

                        <Controller
                            control={control}
                            rules={{ required: 'Last name is required' }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <Input
                                    placeholder="Last Name"
                                    width="80%"
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    style={errors.lastName ? { borderColor: 'red' } : {}}
                                />
                            )}
                            name="lastName"
                        />
                        {errors.lastName && <SizableText style={{ color: 'red' }}>{errors.lastName.message}</SizableText>}

                        <Controller
                            control={control}
                            rules={{
                                required: 'Email is required',
                                pattern: {
                                    value: /^\S+@\S+\.\S+$/,
                                    message: 'Invalid email format'
                                }
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <Input
                                    placeholder="Email"
                                    width="80%"
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    style={errors.email ? { borderColor: 'red' } : {}}
                                />
                            )}
                            name="email"
                        />
                        {errors.email && <SizableText style={{ color: 'red' }}>{errors.email.message}</SizableText>}

                        <Controller
                            control={control}
                            rules={{ required: 'Password is required' }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <XStack width="80%" alignItems="center">
                                    <Input
                                        placeholder="Password"
                                        width="100%"
                                        secureTextEntry={!showPassword}
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                        style={errors.password ? { borderColor: 'red' } : {}}
                                    />
                                    {renderPasswordToggleIcon(showPassword)}
                                </XStack>
                            )}
                            name="password"
                        />
                        {errors.password && <SizableText style={{ color: 'red' }}>{errors.password.message}</SizableText>}

                        <Controller
                            control={control}
                            rules={{ required: 'Confirm password is required' }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <XStack width="80%" alignItems="center">
                                    <Input
                                        placeholder="Confirm Password"
                                        width="100%"
                                        secureTextEntry={!showPassword}
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                        style={errors.passwordConfirm ? { borderColor: 'red' } : {}}
                                    />
                                </XStack>
                            )}
                            name="passwordConfirm"
                        />
                        {errors.passwordConfirm && <SizableText style={{ color: 'red' }}>{errors.passwordConfirm.message}</SizableText>}

                        {passwordMismatch && <SizableText style={{ color: 'red' }}>Passwords don't match</SizableText>}

                        <Controller
                            control={control}
                            rules={{ required: 'Profile picture is required' }}
                            render={({ field: { onChange, value } }) => (
                                <>
                                    <Button onPress={() => pickImage(onChange)}>Choose Profile Picture</Button>
                                    {value && <Image source={{ uri: value }} style={{ width: 100, height: 100 }} />}
                                </>
                            )}
                            name="profilePic"
                        />
                        {errors.profilePic && <SizableText style={{ color: 'red' }}>{errors.profilePic.message}</SizableText>}

                        <Controller
                            control={control}
                            rules={{ required: 'Phone number is required' }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <Input
                                    placeholder="Phone"
                                    width="80%"
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    style={errors.phone ? { borderColor: 'red' } : {}}
                                />
                            )}
                            name="phone"
                        />
                        {errors.phone && <SizableText style={{ color: 'red' }}>{errors.phone.message}</SizableText>}

                        <Controller
                            control={control}
                            rules={{ required: 'Location is required' }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <Input
                                    placeholder="Location"
                                    width="80%"
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    style={errors.location ? { borderColor: 'red' } : {}}
                                />
                            )}
                            name="location"
                        />
                        {errors.location && <SizableText style={{ color: 'red' }}>{errors.location.message}</SizableText>}

                        <Controller
                            control={control}
                            rules={{ required: 'Description is required' }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <Input
                                    placeholder="Say something about yourself/what you do"
                                    width="80%"
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    style={errors.about ? { borderColor: 'red' } : {}}
                                />
                            )}
                            name="about"
                        />
                        {errors.about && <SizableText style={{ color: 'red' }}>{errors.about.message}</SizableText>}

                        <Button iconAfter={isLoading ? <Spinner /> : null} color={constants.colours.secondary} backgroundColor={constants.colours.primary} onPress={handleSubmit(onSubmit)} width="50%">
                            Create Account
                        </Button>
                        <Link style={{ color: "blue" }} href={"/login"}>Already have an account? Login</Link>
                    </YStack>
                </Card>
            </YStack>
        </KeyboardAwareScrollView>
    );
}
