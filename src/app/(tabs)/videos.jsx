import { XStack, YStack, ScrollView, Card, SizableText } from 'tamagui'
export default () => (
    <ScrollView>
        <YStack gap="$2">

            <Card>
                <Card.Header>
                    <SizableText>Hello world</SizableText>
                </Card.Header>
            </Card>

            <YStack width={200} height={200} backgroundColor={"yellow"} />

            <YStack width={200} height={200}  backgroundColor={"green"} />

        </YStack>
    </ScrollView>

)
