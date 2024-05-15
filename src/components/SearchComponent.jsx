import { Input, YStack, XStack, Button, SizableText, Popover } from "tamagui";
import React, { useState } from "react";
import { db } from "../../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Controller, useForm } from "react-hook-form";
import { capitalizeFirstLetter } from "../lib";

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
                                    style={errors.search ? { borderColor: 'red' } : {}}
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
                    maxHeight={200}
                >
                    <Popover.ScrollView>
                        <YStack space="$3" padding="$3">
                            {users.length === 0 ? (
                                <SizableText>No users found</SizableText>
                            ) : (
                                users.map((user, index) => (
                                    <SizableText key={index}>
                                        {capitalizeFirstLetter(user.firstName)} {capitalizeFirstLetter(user.lastName)}
                                    </SizableText>
                                ))
                            )}
                        </YStack>
                    </Popover.ScrollView>
                </Popover.Content>
            </Popover>
        </YStack>
    );
}
