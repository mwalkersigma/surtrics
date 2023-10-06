import React from "react";

export default function useAdminList () {
    const [adminList, setAdminList] = React.useState(null);
    React.useEffect(()=>{
        fetch(`${window.location.origin}/api/getAdminList`)
            .then((res)=>res.json())
            .then((data)=>setAdminList(data));
    },[])
    function isRole (role){
        return(session)=>{
            if(!adminList) return false;
            if(!session) return false;
            let emailLowerCase = session.user.email.toLowerCase();
            let lowerCaseAdminList = adminList.map(user=>{
                let hasAdminRole = user.roles.includes(role);
                if(hasAdminRole){
                    return user.email.toLowerCase();
                }
            });
            return lowerCaseAdminList.includes(emailLowerCase);
        }
    }
    const isAdmin = isRole("admin");
    return {adminList,isAdmin,isRole};
}