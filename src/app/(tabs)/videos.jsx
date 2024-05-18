// App.js
import React from 'react';
import { StyleSheet, View } from 'react-native';
import VideoReel from '../../components/VideoReel';

export default function App() {
    return (
        <View style={styles.container}>
            <VideoReel />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
