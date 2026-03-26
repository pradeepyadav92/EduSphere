// backend/utils/EmailTemplates.js

const getApprovalTemplate = (name, rollNo, enrollmentNo) => {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
            <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; pb-10;">Application Approved! 🎉</h2>
            <p>Dear <strong>${name}</strong>,</p>
            <p>We are pleased to inform you that your application to <strong>EduSphere ERP</strong> has been approved. Welcome to our academic community!</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #2980b9;">Your Credentials:</h3>
                <p><strong>Roll Number:</strong> ${rollNo}</p>
                <p><strong>Enrollment Number:</strong> ${enrollmentNo}</p>
                <p><strong>Note:</strong> You can now use these credentials to log in to the student portal.</p>
            </div>
            
            <p>If you have any questions, please contact the administration office.</p>
            <p style="margin-top: 30px; font-size: 0.9em; color: #7f8c8d;">Best Regards,<br>EduSphere Administration</p>
        </div>
    `;
};

const getRejectionTemplate = (name) => {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
            <h2 style="color: #c0392b; border-bottom: 2px solid #e74c3c; pb-10;">Application Status</h2>
            <p>Dear <strong>${name}</strong>,</p>
            <p>Thank you for your interest in <strong>EduSphere ERP</strong>.</p>
            <p>After careful review of your application, we regret to inform you that we are unable to process your admission at this time.</p>
            <p>We wish you the very best in your future academic endeavors.</p>
            <p style="margin-top: 30px; font-size: 0.9em; color: #7f8c8d;">Best Regards,<br>EduSphere Administration</p>
        </div>
    `;
};

const getResetPasswordTemplate = (type, resetToken) => {
    const resetLink = `${process.env.FRONTEND_API_LINK}/${type}/update-password/${resetToken}`;
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
            <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; pb-10;">Reset Your Password</h2>
            <p>You requested a password reset for your EduSphere account. No problem, it happens!</p>
            <p>Click the button below to set a new password. This link is valid for <strong>10 minutes</strong>.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" style="background-color: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
            </div>
            
            <p>If you didn't request this, you can safely ignore this email.</p>
            <p style="margin-top: 30px; font-size: 0.9em; color: #7f8c8d;">Best Regards,<br>EduSphere Team</p>
        </div>
    `;
};

module.exports = {
  getApprovalTemplate,
  getRejectionTemplate,
  getResetPasswordTemplate
};
