function Confirm() {
    async function doConfirm() {
        try {
            const result = await fetch("http://localhost:3000/api/user/confirmEmail", {
                method : "GET",
                
            });
        } catch (error) {
            
        }
    }
}