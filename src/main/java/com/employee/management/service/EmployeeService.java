package com.employee.management.service;

import com.employee.management.entity.Employee;
import com.employee.management.exception.EmployeeNotFoundException;
import com.employee.management.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    public Optional<Employee> getEmployeeById(Long id) {
        return employeeRepository.findById(id);
    }

    public Optional<Employee> getEmployeeByEmployeeNumber(String employeeNumber) {
        return employeeRepository.findByEmployeeNumber(employeeNumber);
    }

    public Employee createEmployee(Employee employee) {
        return employeeRepository.save(employee);
    }

    public Employee updateEmployee(Long id, Employee updatedEmployee) {
        Employee existing = employeeRepository.findById(id)
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found with id: " + id));

        existing.setFirstName(updatedEmployee.getFirstName());
        existing.setLastName(updatedEmployee.getLastName());
        existing.setPhoneNumber(updatedEmployee.getPhoneNumber());
        existing.setJobTitle(updatedEmployee.getJobTitle());
        existing.setEmploymentType(updatedEmployee.getEmploymentType());
        existing.setEmploymentStatus(updatedEmployee.getEmploymentStatus());
        existing.setLocation(updatedEmployee.getLocation());
        existing.setSkills(updatedEmployee.getSkills());

        return employeeRepository.save(existing);
    }

    public Employee changeStatus(Long id, String status) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found with id: " + id));
        employee.setEmploymentStatus(status);
        return employeeRepository.save(employee);
    }

    public void archiveEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found with id: " + id));
        employee.setEmploymentStatus("archived");
        employeeRepository.save(employee);
    }

    public Employee unarchiveEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found with id: " + id));
        employee.setEmploymentStatus("active");
        return employeeRepository.save(employee);
    }

    public void permanentlyDeleteEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found with id: " + id));
        if (!"archived".equals(employee.getEmploymentStatus())) {
            throw new RuntimeException("Only archived employees can be permanently deleted. Archive them first.");
        }
        employeeRepository.deleteById(id);
    }

    public Employee addSkill(Long id, String skill) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found with id: " + id));

        String currentSkills = employee.getSkills();
        if (currentSkills == null || currentSkills.isEmpty()) {
            employee.setSkills(skill);
        } else {
            List<String> skillList = Arrays.stream(currentSkills.split(","))
                    .map(String::trim)
                    .collect(Collectors.toList());
            if (!skillList.contains(skill.trim())) {
                skillList.add(skill.trim());
                employee.setSkills(String.join(", ", skillList));
            }
        }
        return employeeRepository.save(employee);
    }

    public Employee removeSkill(Long id, String skill) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found with id: " + id));

        String currentSkills = employee.getSkills();
        if (currentSkills != null && !currentSkills.isEmpty()) {
            List<String> skillList = Arrays.stream(currentSkills.split(","))
                    .map(String::trim)
                    .filter(s -> !s.equalsIgnoreCase(skill.trim()))
                    .collect(Collectors.toList());
            employee.setSkills(String.join(", ", skillList));
        }
        return employeeRepository.save(employee);
    }

    public List<Employee> searchEmployees(String query, String status, String employmentType,
                                          String jobTitle, String location, String skill) {
        if (query != null && !query.isEmpty()) {
            return employeeRepository.searchByQuery(query);
        }
        if (status != null) return employeeRepository.findByEmploymentStatus(status);
        if (employmentType != null) return employeeRepository.findByEmploymentType(employmentType);
        if (jobTitle != null) return employeeRepository.findByJobTitle(jobTitle);
        if (location != null) return employeeRepository.findByLocation(location);
        if (skill != null) return employeeRepository.findBySkillsContaining(skill);

        return employeeRepository.findAll();
    }
}