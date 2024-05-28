import {useDispatch} from "react-redux";
import UserProfile from "../../../components/UserProfile";
import {useLocalSearchParams} from "expo-router"
import {useEffect} from "react";
import {getOtherUser} from "../../../features/user/userSlice";

export default function Profile() {
    const {uid} = useLocalSearchParams();
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(getOtherUser(uid))
    }, []);

    return (
        <UserProfile uid={uid}/>
    )
}
