import React from "react";

export default function useAdminList () {
    const [adminList, setAdminList] = React.useState(null);
    React.useEffect(()=>{
        fetch(`${window.location.origin}/api/getAdminList`)
            .then((res)=>res.json())
            .then((data)=>setAdminList(data));
    },[])
    function isAdmin(session){
        if(!adminList) return false;
        if(!session) return false;
        let emailLowerCase = session.user.email.toLowerCase();
        let lowerCaseAdminList = adminList.map(m=>m.toLowerCase());
        return lowerCaseAdminList.includes(emailLowerCase);
    }
    return {adminList,isAdmin};
}