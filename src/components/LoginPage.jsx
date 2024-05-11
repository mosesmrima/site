import React, { useState } from 'react';
import { Image } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useForm, Controller } from "react-hook-form";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { signIn } from "../authService";
import { router } from "expo-router";
import { getFirebaseAuthErrorMessage } from "../firebaseAuthErrorMessageHandler";
import { Button, Input, Card, YStack, XStack, H1, SizableText, Spinner } from "tamagui";
import constants from "../constants";
import loginImage from "../../assets/undraw_secure_login_pdn4.png";


export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const { control, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            email: "",
            password: ""
        }
    });
    const [showPassword, setShowPassword] = useState(false);


    const onSubmit = data => {
        setIsLoading(true);
        signIn(data.email, data.password)
            .then(userCredential => {
                setIsLoading(false);
                router.replace("/");
            })
            .catch(err => {
                setIsLoading(false);
                const friendlyMessage = getFirebaseAuthErrorMessage(err.code);
            });
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const renderPasswordToggleIcon = () => (
        <Button
            onPress={togglePasswordVisibility}
            size="$2"
            icon={<MaterialCommunityIcons name={showPassword ? 'eye-off' : 'eye'} size={24} color="grey" />}
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
                    <YStack alignItems={"center"} width={"100%"} gap={4}>
                        <H1 size="$4">Login</H1>
                        <Image source={loginImage} style={{width: 300, height: 200}}/>
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
                        {errors.email && <SizableText style={{ color: 'red' }}>{errors.email.message}</SizableText>}

                        <Controller
                            control={control}
                            rules={{
                                required: 'Password is required'
                            }}
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
                        {errors.password && <SizableText style={{ color: 'red' }}>{errors.password.message}</SizableText>}

                        <Button iconAfter={isLoading?Spinner:null}  color={constants.colours.secondary} backgroundColor={constants.colours.primary} onPress={handleSubmit(onSubmit)} width="50%">
                            Login
                        </Button>
                    </YStack>
                </Card>
            </YStack>
        </KeyboardAwareScrollView>
    );
}
