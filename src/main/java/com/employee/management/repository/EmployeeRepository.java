package com.employee.management.repository;

import com.employee.management.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Optional<Employee> findByEmployeeNumber(String employeeNumber);

    Optional<Employee> findByEmail(String email);

    List<Employee> findByEmploymentStatus(String status);

    List<Employee> findByEmploymentType(String type);

    List<Employee> findByJobTitle(String jobTitle);

    List<Employee> findByLocation(String location);

    List<Employee> findBySkillsContaining(String skill);

    // Search across multiple fields
    @Query("SELECT e FROM Employee e WHERE " +
            "LOWER(e.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(e.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(e.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(e.employeeNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(e.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(e.phoneNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(e.jobTitle) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(e.skills) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Employee> searchByQuery(@Param("query") String query);
}