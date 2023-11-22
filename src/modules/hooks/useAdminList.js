import useUpdates from "./useUpdates";

export default function useAdminList () {
    const roleList = useUpdates("/api/admin/user");
    function isRole (role){
        return(session)=>{
            if(!roleList) return false;
            if(!session) return false;
            if(!roleList.length) return false;
            if(!roleList.length > 0) return false;
            console.log(roleList)
            console.log(typeof roleList.map)
            try {
                let emailLowerCase = session.user.email.toLowerCase();
                let lowerCaseAdminList = roleList.map(user => {
                    let hasRole = user.roles.includes(role);
                    if (hasRole) {
                        return user.email.toLowerCase();
                    }
                });
                return lowerCaseAdminList.includes(emailLowerCase);
            } catch (e) {
                console.log(e);
                return false;
            }
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