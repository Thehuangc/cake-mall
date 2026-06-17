package com.cakemall.module.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterDto {
    @NotBlank(message = "请输入用户名")
    @Size(min = 2, max = 50, message = "用户名长度2-50个字符")
    private String username;

    @NotBlank(message = "请输入邮箱")
    @Email(message = "请输入正确的邮箱")
    private String email;

    @NotBlank(message = "请输入密码")
    @Size(min = 6, message = "密码至少6位")
    private String password;
}
