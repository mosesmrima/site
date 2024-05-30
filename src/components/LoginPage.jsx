import React, { useState } from 'react';
import { Image } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useForm, Controller } from "react-hook-form";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { signIn } from "../authService";
import { router, Link } from "expo-router";
import { getFirebaseAuthErrorMessage } from "../firebaseAuthErrorMessageHandler";
import { Button, Input, Card, YStack, XStack, Spinner, Text } from "tamagui";
import constants from "../constants";
import loginImage from "../../assets/undraw_secure_login_pdn4.png";
import {auth} from "../../firebaseConfig"
import {getUser} from "../features/user/userSlice";
import {useDispatch} from "react-redux";

export default function LoginPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState(null);
    const dispatch = useDispatch();
    const { control, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            email: "",
            password: ""
        }
    });

    const onSubmit = async data => {
        setIsSubmitting(true);
        try {
            await signIn(data.email, data.password);
            let authInstance = await auth;
            authInstance.onAuthStateChanged(async user => {
                if (user) {
                    try {
                        await dispatch(getUser());
                        router.replace("/videos");
                    } catch (error) {
                        console.error('Error fetching user:', error);
                    }
                }
            });

        } catch (err) {
            const friendlyMessage = getFirebaseAuthErrorMessage(err.code);
            setLoginError(friendlyMessage)
        } finally {
            setIsSubmitting(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const renderPasswordToggleIcon = () => (
        <Button
            onPress={togglePasswordVisibility}
            icon={<MaterialCommunityIcons size={20} name={showPassword ? 'eye-off' : 'eye'} color="grey" />}
            backgroundColor="transparent"
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
            <YStack alignItems="center" justifyContent="center" height="100%" width="100%">
                <Card unstyled={true} maxWidth={500} width="90%" padding={20} alignItems="center">
                    <YStack alignItems="center" width="100%" gap={4}>
                        <Text>Login</Text>
                        <Image source={loginImage} style={{ width: 300, height: 200 }} />
                        <Controller
                            control={control}
                            rules={{
                                required: 'Email is required',
                                pattern: {
                                    value: /^\S+@\S+\.\S+$/,
                                    message: 'Entered value does not match email format'
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
                        {errors.email && <Text style={{ color: 'red' }}>{errors.email.message}</Text>}

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
                                    {renderPasswordToggleIcon()}
                                </XStack>
                            )}
                            name="password"
                        />
                        {errors.password && <Text style={{ color: 'red' }}>{errors.password.message}</Text>}

                        <Button iconAfter={isSubmitting ? <Spinner /> : null} color={constants.colours.secondary} backgroundColor={constants.colours.primary} onPress={handleSubmit(onSubmit)} width="50%">
                            Login
                        </Button>
                        {loginError && <Text style={{color: "red"}}>{loginError}</Text>}
                        <Link style={{ color: "blue" }} href={"/create"}>Don't have an account? Create</Link>
                    </YStack>
                </Card>
            </YStack>
        </KeyboardAwareScrollView>
    );
}
