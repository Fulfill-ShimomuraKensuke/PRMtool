package com.example.prmtool.service;

import com.example.prmtool.dto.ProjectRequest;
import com.example.prmtool.dto.ProjectResponse;
import com.example.prmtool.entity.Partner;
import com.example.prmtool.entity.Project;
import com.example.prmtool.entity.User;
import com.example.prmtool.repository.PartnerRepository;
import com.example.prmtool.repository.ProjectRepository;
import com.example.prmtool.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.Objects;

@Service
public class ProjectService {

        private final ProjectRepository projectRepository;
        private final PartnerRepository partnerRepository;
        private final UserRepository userRepository;

        public ProjectService(ProjectRepository projectRepository,
                        PartnerRepository partnerRepository,
                        UserRepository userRepository) {
                this.projectRepository = projectRepository;
                this.partnerRepository = partnerRepository;
                this.userRepository = userRepository;
        }

        @Transactional
        public ProjectResponse createProject(ProjectRequest request) {
                Partner partner = partnerRepository.findById(Objects.requireNonNull(request.getPartnerId()))
                                .orElseThrow(() -> new RuntimeException("パートナーが見つかりません: " + request.getPartnerId()));

                User owner = userRepository.findById(Objects.requireNonNull(request.getOwnerId()))
                                .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません: " + request.getOwnerId()));

                Project project = Project.builder()
                                .name(request.getName())
                                .status(request.getStatus())
                                .partner(partner)
                                .owner(owner)
                                .build();

                Project savedProject = projectRepository.save(
                                Objects.requireNonNull(project));
                return ProjectResponse.from(savedProject);
        }

        @Transactional(readOnly = true)
        public List<ProjectResponse> getAllProjects() {
                return projectRepository.findAll().stream()
                                .map(ProjectResponse::from)
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public List<ProjectResponse> getProjectsByOwner(UUID ownerId) {
                return projectRepository.findByOwnerId(ownerId).stream()
                                .map(ProjectResponse::from)
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public List<ProjectResponse> getVisibleProjectsForPartner(UUID myUserId) {
                return projectRepository.findDistinctByStatusOrOwnerId(Project.ProjectStatus.NEW, myUserId).stream()
                                .map(ProjectResponse::from)
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public ProjectResponse getProjectById(UUID id) {
                Project project = projectRepository.findById(Objects.requireNonNull(id))
                                .orElseThrow(() -> new RuntimeException("案件が見つかりません: " + id));
                return ProjectResponse.from(project);
        }

        @Transactional
        public ProjectResponse updateProject(UUID id, ProjectRequest request, String editorEmail) {
                Project project = projectRepository.findById(Objects.requireNonNull(id))
                                .orElseThrow(() -> new RuntimeException("案件が見つかりません: " + id));

                Partner partner = partnerRepository.findById(Objects.requireNonNull(request.getPartnerId()))
                                .orElseThrow(() -> new RuntimeException("パートナーが見つかりません: " + request.getPartnerId()));

                User editor = userRepository.findByEmail(editorEmail)
                                .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません: " + editorEmail));

                project.setName(request.getName());
                project.setStatus(request.getStatus());
                project.setPartner(partner);

                // 担当者は常に編集者にする
                project.setOwner(editor);

                Project updatedProject = projectRepository.save(project);
                return ProjectResponse.from(updatedProject);
        }

        @Transactional(readOnly = true)
        public ProjectResponse getProjectByIdWithAccessControl(UUID id, String email) {
                User me = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません: " + email));

                Project project = projectRepository.findById(Objects.requireNonNull(id))
                                .orElseThrow(() -> new RuntimeException("案件が見つかりません: " + id));

                boolean isAdmin = me.getRole() == User.UserRole.ADMIN;
                if (!isAdmin) {
                        boolean canView = project.getStatus() == Project.ProjectStatus.NEW
                                        || project.getOwner().getId().equals(me.getId());
                        if (!canView) {
                                throw new AccessDeniedException("権限がありません");
                        }
                }
                return ProjectResponse.from(project);
        }

        @Transactional
        public void deleteProject(UUID id) {
                if (!projectRepository.existsById(Objects.requireNonNull(id))) {
                        throw new RuntimeException("案件が見つかりません: " + id);
                }
                projectRepository.deleteById(Objects.requireNonNull(id));
        }
}