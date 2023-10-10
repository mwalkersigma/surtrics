import React, {useEffect, useState} from "react";

export default function useAdminList () {
    const [roleList, setRoleList] = useState(null);
    useEffect(()=>{
        fetch(`${window.location.origin}/api/getAdminList`)
            .then((res)=>res.json())
            .then((data)=>setRoleList(data));
    },[])
    function isRole (role){
        return(session)=>{
            if(!roleList) return false;
            if(!session) return false;
            let emailLowerCase = session.user.email.toLowerCase();
            let lowerCaseAdminList = roleList.map(user=>{
                let hasRole = user.roles.includes(role);
                if(hasRole){
                    return user.email.toLowerCase();
                }
            });
            return lowerCaseAdminList.includes(emailLowerCase);
        }
    }
    function getRoles (session){
        if(!roleList) return [];
        if(!session) return [];
        let emailLowerCase = session.user.email.toLowerCase();
        let user = roleList.find((user)=>user.email.toLowerCase() === emailLowerCase);
        if(!user)return [];
        return user.roles;
    }
    const isAdmin = isRole("admin");
    return {adminList: roleList,isAdmin,isRole,getRoles};
}