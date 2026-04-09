package com.campusnex.hub.config;

import com.campusnex.hub.model.entity.Resource;
import com.campusnex.hub.model.entity.User;
import com.campusnex.hub.model.enums.*;
import com.campusnex.hub.repository.ResourceRepository;
import com.campusnex.hub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUsers();
        seedResources();
    }

    private void seedUsers() {
        if (userRepository.count() > 0) return;

        userRepository.save(User.builder()
                .name("Admin User").email("admin@campus.edu")
                .password(passwordEncoder.encode("admin123"))
                .role(Role.ADMIN)
                .profilePicture("https://api.dicebear.com/7.x/avataaars/svg?seed=Admin")
                .build());

        userRepository.save(User.builder()
                .name("John Doe").email("john@campus.edu")
                .password(passwordEncoder.encode("user123"))
                .role(Role.USER)
                .profilePicture("https://api.dicebear.com/7.x/avataaars/svg?seed=John")
                .build());

        userRepository.save(User.builder()
                .name("Tech Sara").email("sara@campus.edu")
                .password(passwordEncoder.encode("tech123"))
                .role(Role.TECHNICIAN)
                .profilePicture("https://api.dicebear.com/7.x/avataaars/svg?seed=Sara")
                .build());

        log.info("✅ Seed users created: admin@campus.edu (admin123), john@campus.edu (user123), sara@campus.edu (tech123)");
    }

    private void seedResources() {
        if (resourceRepository.count() > 0) return;

        User admin = userRepository.findByEmail("admin@campus.edu").orElse(null);

        resourceRepository.save(Resource.builder()
                .resourceName("Main Lecture Hall A").resourceCode("LH-01")
                .type(ResourceType.LECTURE_HALL).capacity(250)
                .location("Engineering Building").floor("Ground")
                .description("Large lecture hall with 4K projector, surround sound, and 250 seats.")
                .availabilityStart("08:00").availabilityEnd("20:00")
                .status(ResourceStatus.ACTIVE).createdBy(admin).build());

        resourceRepository.save(Resource.builder()
                .resourceName("Advanced Robotics Lab").resourceCode("LAB-05")
                .type(ResourceType.LAB).capacity(30)
                .location("Science Block").floor("2nd")
                .description("Equipped with robotic arms, 3D printers, and IoT development kits.")
                .availabilityStart("09:00").availabilityEnd("18:00")
                .status(ResourceStatus.ACTIVE).createdBy(admin).build());

        resourceRepository.save(Resource.builder()
                .resourceName("Meeting Room Alpha").resourceCode("MR-A")
                .type(ResourceType.MEETING_ROOM).capacity(8)
                .location("Main Library").floor("Ground")
                .description("Cozy 8-person meeting room with whiteboard and HDMI display.")
                .availabilityStart("08:00").availabilityEnd("22:00")
                .status(ResourceStatus.ACTIVE).createdBy(admin).build());

        resourceRepository.save(Resource.builder()
                .resourceName("Meeting Room Beta").resourceCode("MR-B")
                .type(ResourceType.MEETING_ROOM).capacity(12)
                .location("Admin Block").floor("1st")
                .description("12-person boardroom-style meeting room with video conferencing.")
                .availabilityStart("08:00").availabilityEnd("20:00")
                .status(ResourceStatus.ACTIVE).createdBy(admin).build());

        resourceRepository.save(Resource.builder()
                .resourceName("Projector Pro 4K").resourceCode("EQ-01")
                .type(ResourceType.EQUIPMENT).capacity(0)
                .location("Resource Center").floor("2nd")
                .description("High-definition 4K portable projector for lectures and events.")
                .availabilityStart("07:00").availabilityEnd("21:00")
                .status(ResourceStatus.ACTIVE).createdBy(admin).build());

        resourceRepository.save(Resource.builder()
                .resourceName("Sony Video Camera").resourceCode("EQ-02")
                .type(ResourceType.EQUIPMENT).capacity(0)
                .location("Resource Center").floor("2nd")
                .description("Professional Sony camcorder for recording university events.")
                .availabilityStart("07:00").availabilityEnd("21:00")
                .status(ResourceStatus.ACTIVE).createdBy(admin).build());

        resourceRepository.save(Resource.builder()
                .resourceName("Computer Lab C").resourceCode("LAB-C")
                .type(ResourceType.LAB).capacity(40)
                .location("IT Building").floor("1st")
                .description("40-seat computer lab with high-performance workstations and dual monitors.")
                .availabilityStart("08:00").availabilityEnd("22:00")
                .status(ResourceStatus.OUT_OF_SERVICE).createdBy(admin).build());

        log.info("✅ Seed resources created (7 resources)");
    }
}
