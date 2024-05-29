import { Input, YStack, XStack, Button, SizableText, Popover, Avatar } from "tamagui";
import React, { useState } from "react";
import { db } from "../../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Controller, useForm } from "react-hook-form";
import { capitalizeFirstLetter } from "../utils/lib";
import defaultAvatar from "../../assets/defaultAvatar.png";
import constants from "../constants";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { TouchableOpacity } from "react-native";
import { router } from "expo-router";

export default function SearchComponent() {
    const [users, setUsers] = useState([]);
    const { control, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            search: ""
        }
    });

    const fetchUsers = async ({ search }) => {
        try {
            const q = query(collection(db, "users"), where("firstName", ">=", capitalizeFirstLetter(search)));
            const querySnapshot = await getDocs(q);
            let users = [];
            querySnapshot.forEach((doc) => {
                users.push(doc.data());
            });
            setUsers(users);
        } catch (err) {
            console.log("Error fetching users:", err);
        }
    };

    const onSearch = async (data) => {
        await fetchUsers(data);
        setPopoverOpen(true); // Open the popover after fetching users
    };

    const [popoverOpen, setPopoverOpen] = useState(false);

    return (
        <YStack>
            <Popover
                size="$10"
                allowFlip
                open={popoverOpen}
                onOpenChange={(open) => setPopoverOpen(open)}
            >
                <Popover.Trigger asChild>
                    <XStack gap={3} width={250}>
                        <Controller
                            control={control}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <Input
                                    placeholder="Search user"
                                    width="80%"
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                />
                            )}
                            name="search"
                        />
                        <Button onPress={handleSubmit(onSearch)}>Search</Button>
                    </XStack>
                </Popover.Trigger>

                <Popover.Content
                    borderWidth={1}
                    borderColor="$borderColor"
                    enterStyle={{ y: -10, opacity: 0 }}
                    exitStyle={{ y: -10, opacity: 0 }}
                    elevate
                    animation={[
                        'quick',
                        {
                            opacity: {
                                overshootClamping: true,
                            },
                        },
                    ]}
                    maxHeight={400}
                >
                    <Popover.Close asChild>
                        <TouchableOpacity onPress={() => setPopoverOpen(false)}>
                            <FontAwesome size={18} name="close" color={constants.colours.primary} />
                        </TouchableOpacity>
                    </Popover.Close>

                    <Popover.ScrollView>
                        <YStack>
                            {users.length === 0 ? (
                                <SizableText>No users found</SizableText>
                            ) : (
                                users.map((user, index) => (
                                    <TouchableOpacity key={index} onPress={() => {
                                        router.push({
                                            pathname: `/users/${user.uid}`,
                                            params: { uid: user.uid }
                                        });
                                    }}>
                                        <XStack alignItems="center" padding={8} borderRadius={20} backgroundColor={constants.colours.secondary}>
                                            <Avatar circular size="$3">
                                                <Avatar.Image
                                                    source={user.profilePic ? user.profilePic : defaultAvatar}
                                                />
                                            </Avatar>
                                            <SizableText>
                                                {capitalizeFirstLetter(user.firstName)} {capitalizeFirstLetter(user.lastName)}
                                            </SizableText>
                                        </XStack>
                                    </TouchableOpacity>
                                ))
                            )}
                        </YStack>
                    </Popover.ScrollView>
                </Popover.Content>
            </Popover>
        </YStack>
    );
}
