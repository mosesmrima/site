// noinspection JSValidateTypes

import {YStack, SizableText, Button, Input, Card, XStack, H1, Spinner} from "tamagui";
import constants from "../constants";
import signupImage from "../../assets/undraw_Welcoming_re_x0qo.png";
import { Image } from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useForm, Controller } from "react-hook-form";
import React, { useState } from "react";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {signUp} from "../authService";
import {Link, router} from "expo-router";
import {getFirebaseAuthErrorMessage} from "../firebaseAuthErrorMessageHandler";
import {db, auth} from "../../firebaseConfig"
import { doc, setDoc } from "firebase/firestore";
import {capitalizeFirstLetter} from "../utils/lib"


export default function CreateAccountPage() {
    const { control, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            passwordConfirm: ""
        }
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [passwordMissmatch, setPasswordMissmatch] = useState(false);


    const onSubmit = data => {
        if (data.password !== data.passwordConfirm) {
            setPasswordMissmatch(true);
        } else {
            setPasswordMissmatch(false);
            setIsLoading(true);
            signUp(data.email, data.password, data.firstName, data.lastName)
                .then(() => {
                    if (auth.currentUser) {
                        return  setDoc(doc(db, "users", auth.currentUser.uid), {
                            firstName: capitalizeFirstLetter(data.firstName),
                            lastName: capitalizeFirstLetter(data.lastName),
                            email: data.email.toLowerCase(),
                            uid: auth.currentUser.uid,
                            profilePic: null,
                            followers: [],
                            following: []
                        });
                    } else {
                        throw new Error('User not authenticated');
                    }
                })
                .then(() => {
                    setIsLoading(false);
                    router.replace("/");
                })
                .catch((err) => {
                    setIsLoading(false);
                    console.log("Error:", err);
                    if (err.code) {
                        const friendlyMessage = getFirebaseAuthErrorMessage(err.code);
                        console.log(friendlyMessage);
                    }
                });

        }
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };



    const renderPasswordToggleIcon = (show) => (
        <Button
            onPress={show ? togglePasswordVisibility : togglePasswordVisibility}
            size="$2"
            icon={<MaterialCommunityIcons name={show ? 'eye-off' : 'eye'} size={24} color="grey" />}
            borderRadius="$0"
            backgroundColor="transparent"
            borderWidth="0"
        />
    );

    return (
        <KeyboardAwareScrollView
            style={{ flex: 1 }}
            resetScrollToCoords={{ x: 0, y: 0 }}
            contentContainerStyle={{ flexGrow: 1 }}
            scrollEnabled={false}
            enableOnAndroid={true}
        >
            <YStack alignItems="center" justifyContent="center" height="100vh" width="100%">
                <Card unstyled={true} maxWidth={500} width="90%" padding={20} alignItems="center">
                    <YStack alignItems={"center"} width={"100%"}  gap={4}>
                        <H1 size="$4">Create Account</H1>
                        <Image source={signupImage} style={{width: 300, height: 200}}/>

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

                        {passwordMissmatch && <SizableText color={"red"}>Passwords don't match</SizableText>}
                        <Button iconAfter={isLoading?Spinner:null}  color={constants.colours.secondary} backgroundColor={constants.colours.primary} onPress={handleSubmit(onSubmit)} width="50%">
                            Create Account
                        </Button>
                        <Link style={{color: "blue"}} href={"/login"}>Already have an account? Login</Link>
                    </YStack>
                </Card>
            </YStack>
        </KeyboardAwareScrollView>
    );
}
