package com.playnode.auth_service.controller;

import com.playnode.auth_service.dto.authResponse;
import com.playnode.auth_service.dto.loginRequest;
import com.playnode.auth_service.dto.registerRequest;
import com.playnode.auth_service.service.loginService;
import com.playnode.auth_service.service.registerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class authController {

    @Autowired
    private registerService registerService;

    @Autowired
    private loginService loginService;

    /**
     * Endpoint per registrazione
     * POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<authResponse> register(@RequestBody registerRequest request) {
        authResponse response = registerService.register(request);

        if (response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Endpoint per login
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<authResponse> login(@RequestBody loginRequest request) {
        authResponse response = loginService.login(request);

        if (response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }
}