package com.employee.management.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "employees")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String employeeNumber;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    private String fullName;

    @Column(unique = true, nullable = false)
    private String email;

    private String phoneNumber;

    private String jobTitle;

    private String employmentType;  // full_time, part_time, contract, intern

    private String employmentStatus; // active, on_leave, terminated, archived

    private String location;

    @Column(length = 1000)
    private String skills;  // comma-separated: "Java,Spring,SQL"

    private LocalDate dateOfHire;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        fullName = firstName + " " + lastName;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        fullName = firstName + " " + lastName;
    }
}