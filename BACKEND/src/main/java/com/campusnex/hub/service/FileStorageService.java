package com.campusnex.hub.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class FileStorageService {

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    private static final List<String> ALLOWED_TYPES = List.of("image/jpeg", "image/png", "image/gif", "image/webp");
    private static final long MAX_SIZE = 5 * 1024 * 1024; // 5MB

    public List<String> storeFiles(MultipartFile[] files) {
        List<String> storedPaths = new ArrayList<>();
        if (files == null) return storedPaths;

        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;
            if (!ALLOWED_TYPES.contains(file.getContentType())) {
                throw new IllegalArgumentException("Invalid file type. Only JPEG, PNG, GIF, WEBP allowed.");
            }
            if (file.getSize() > MAX_SIZE) {
                throw new IllegalArgumentException("File too large. Maximum size is 5MB.");
            }
            storedPaths.add(store(file));
        }
        return storedPaths;
    }

    private String store(MultipartFile file) {
        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            String originalName = StringUtils.cleanPath(file.getOriginalFilename());
            String ext = originalName.contains(".")
                    ? originalName.substring(originalName.lastIndexOf('.')) : "";
            String fileName = UUID.randomUUID() + ext;

            Path targetPath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            log.info("Stored file: {}", fileName);
            return "/uploads/" + fileName;
        } catch (IOException ex) {
            throw new RuntimeException("Failed to store file: " + ex.getMessage(), ex);
        }
    }

    public void deleteFile(String filePath) {
        try {
            Path path = Paths.get(uploadDir).toAbsolutePath().normalize()
                    .resolve(Paths.get(filePath).getFileName());
            Files.deleteIfExists(path);
        } catch (IOException ex) {
            log.warn("Could not delete file: {}", filePath);
        }
    }
}
