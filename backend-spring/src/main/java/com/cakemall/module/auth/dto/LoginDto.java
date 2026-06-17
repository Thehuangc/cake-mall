package com.cakemall.module.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginDto {
    @NotBlank(message = "请输入邮箱或用户名")
    private String email;

    @NotBlank(message = "请输入密码")
    private String password;
}
