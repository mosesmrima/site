import { YStack, SizableText, Button, Input, Card, Spinner, H1 } from "tamagui";
import { Image } from "react-native";
import forgotImage from "../../assets/undraw_Forgot_password_re_hxwm.png";
import { useForm, Controller } from "react-hook-form";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useState } from "react";
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

export default function PasswordReset() {
    const [isLoading, setIsLoading] = useState(false);
    const [linkSent, setLinkSent] = useState(false);
    const { control, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            email: ""
        }
    });

    const onSubmit = data => {
        setIsLoading(true);
        sendPasswordResetEmail(auth, data.email)
            .then(() => {
                setIsLoading(false);
                setLinkSent(true);
                console.log("Password reset email sent");
            })
            .catch((error) => {
                setIsLoading(false);
                console.error("Error sending password reset email: ", error);
            });
    }

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
                    <YStack alignItems="center" width="100%" gap={4}>
                        <H1>Password Reset</H1>
                        <Image source={forgotImage} style={{ width: 300, height: 200 }} />
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
                                    placeholder="Enter your email"
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
                        {isLoading ? (
                            <Spinner />  // Ensure you have a Spinner component or similar in Tamagui
                        ) : linkSent ? (
                            <>
                                <SizableText style={{ color: 'green' }}>Link Sent!</SizableText>
                                <Button onPress={() => { /* navigate to login */ }} size="$4" backgroundColor={constants.colours.primary}>
                                    Back to Login
                                </Button>
                            </>
                        ) : (
                            <Button onPress={handleSubmit(onSubmit)} size="$4" backgroundColor={constants.colours.primary}>
                                Reset Password
                            </Button>
                        )}
                    </YStack>
                </Card>
            </YStack>
        </KeyboardAwareScrollView>
    );
}
