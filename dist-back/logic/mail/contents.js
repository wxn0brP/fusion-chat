const contents = {
    register(code) {
        return {
            subject: "Fusion Chat | Register",
            html: `
                <h1>Register account</h1>
                <h2>Code: ${code}</h2>
            `
        };
    },
    resetPassword(code) {
        return {
            subject: "Fusion Chat | Reset Password",
            html: `
                <h1>Reset password</h1>
                <h2>Code: ${code}</h2>
            `
        };
    },
    login(name, device) {
        return {
            subject: "Fusion Chat | Account Login Alert",
            html: `
                <h1>Login Alert</h1>
                <p>Hello ${name},</p>
                <p>We detected a login to your account from the following device: ${device}</p>
                <p>If this was you, you can ignore this message. If you didn't log in, please change your password immediately.</p>
                <p>Thank you. Fusion Chat Team.</p>
            `
        };
    },
    confirmDeleteAccount(name, link, cancelLink) {
        return {
            subject: "Fusion Chat | Confirm Delete Account",
            html: `
                <h1>Confirm Account Deletion</h1>
                <p>Hello ${name},</p>
                <p>If you wish to delete your account, please click the following <a href="${link}">link</a></p>
                <p>If you change your mind, after confirming, you have 24 hours to cancel the process using this <a href="${cancelLink}">link</a>.</p>
                <p>Once your account is deleted, all your data will be permanently removed.</p>
                <p>Thank you, Fusion Chat Team.</p>
            `
        };
    },
    deletedAccount(name) {
        return {
            subject: "Fusion Chat | Account Deleted",
            html: `
                <h1>Account Deleted</h1>
                <p>Hello ${name},</p>
                <p>Your account has been successfully deleted.</p>
                <p>Goodbye, thanks for this time. Fusion Chat Team.</p>
            `
        };
    }
};
export default contents;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9iYWNrL2xvZ2ljL21haWwvY29udGVudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxRQUFRLEdBQUc7SUFDYixRQUFRLENBQUMsSUFBWTtRQUNqQixPQUFPO1lBQ0gsT0FBTyxFQUFFLHdCQUF3QjtZQUNqQyxJQUFJLEVBQUU7OzRCQUVVLElBQUk7YUFDbkI7U0FDSixDQUFDO0lBQ04sQ0FBQztJQUNELGFBQWEsQ0FBQyxJQUFZO1FBQ3RCLE9BQU87WUFDSCxPQUFPLEVBQUUsOEJBQThCO1lBQ3ZDLElBQUksRUFBRTs7NEJBRVUsSUFBSTthQUNuQjtTQUNKLENBQUM7SUFDTixDQUFDO0lBQ0QsS0FBSyxDQUFDLElBQVksRUFBRSxNQUFjO1FBQzlCLE9BQU87WUFDSCxPQUFPLEVBQUUsbUNBQW1DO1lBQzVDLElBQUksRUFBRTs7MkJBRVMsSUFBSTtvRkFDcUQsTUFBTTs7O2FBRzdFO1NBQ0osQ0FBQztJQUNOLENBQUM7SUFDRCxvQkFBb0IsQ0FBQyxJQUFZLEVBQUUsSUFBWSxFQUFFLFVBQWtCO1FBQy9ELE9BQU87WUFDSCxPQUFPLEVBQUUsc0NBQXNDO1lBQy9DLElBQUksRUFBRTs7MkJBRVMsSUFBSTs2RkFDOEQsSUFBSTs0SEFDMkIsVUFBVTs7O2FBR3pIO1NBQ0osQ0FBQztJQUNOLENBQUM7SUFDRCxjQUFjLENBQUMsSUFBWTtRQUN2QixPQUFPO1lBQ0gsT0FBTyxFQUFFLCtCQUErQjtZQUN4QyxJQUFJLEVBQUU7OzJCQUVTLElBQUk7OzthQUdsQjtTQUNKLENBQUM7SUFDTixDQUFDO0NBQ0osQ0FBQTtBQUVELGVBQWUsUUFBUSxDQUFDIn0=