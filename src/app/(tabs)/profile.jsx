import {useSelector} from "react-redux";

import UserProfile from "../../components/UserProfile";


export default function Profile() {
    const {currentUser} = useSelector(store => store.user)
    return (
        <UserProfile uid={currentUser.uid}/>
    )
}
