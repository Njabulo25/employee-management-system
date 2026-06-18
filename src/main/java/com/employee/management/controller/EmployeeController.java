package com.employee.management.controller;

import com.employee.management.entity.Employee;
import com.employee.management.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    @GetMapping
    public List<Employee> getAllEmployees() {
        return employeeService.getAllEmployees();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable Long id) {
        return employeeService.getEmployeeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public List<Employee> searchEmployees(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String employmentType,
            @RequestParam(required = false) String jobTitle,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String skill) {
        return employeeService.searchEmployees(query, status, employmentType, jobTitle, location, skill);
    }

    @PostMapping
    public Employee createEmployee(@RequestBody Employee employee) {
        return employeeService.createEmployee(employee);
    }

    @PutMapping("/{id}")
    public Employee updateEmployee(@PathVariable Long id, @RequestBody Employee employee) {
        return employeeService.updateEmployee(id, employee);
    }

    @PatchMapping("/{id}/status")
    public Employee changeStatus(@PathVariable Long id, @RequestParam String status) {
        return employeeService.changeStatus(id, status);
    }

    @PatchMapping("/{id}/archive")
    public ResponseEntity<Void> archiveEmployee(@PathVariable Long id) {
        employeeService.archiveEmployee(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/unarchive")
    public ResponseEntity<Employee> unarchiveEmployee(@PathVariable Long id) {
        return ResponseEntity.ok(employeeService.unarchiveEmployee(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> permanentlyDeleteEmployee(@PathVariable Long id) {
        employeeService.permanentlyDeleteEmployee(id);
        return ResponseEntity.ok("Employee permanently deleted");
    }

    @PatchMapping("/{id}/skills/add")
    public Employee addSkill(@PathVariable Long id, @RequestParam String skill) {
        return employeeService.addSkill(id, skill);
    }

    @PatchMapping("/{id}/skills/remove")
    public Employee removeSkill(@PathVariable Long id, @RequestParam String skill) {
        return employeeService.removeSkill(id, skill);
    }
}