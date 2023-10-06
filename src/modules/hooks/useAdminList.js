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
    const isAdmin = isRole("admin");
    return {adminList: roleList,isAdmin,isRole};
}