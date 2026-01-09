package com.example.prmtool.controller;

import java.net.URI;
import java.util.Objects;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RootController {

  @GetMapping("/")
  public ResponseEntity<Void> root() {
    return ResponseEntity
        .status(302)
        .location(Objects.requireNonNull(URI.create("/api/health")))
        .build();
  }
}
