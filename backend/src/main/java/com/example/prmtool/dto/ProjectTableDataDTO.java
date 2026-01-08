package com.example.prmtool.dto;

import com.example.prmtool.entity.ProjectTableData;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectTableDataDTO {

    private UUID id;
    private String tableDataJson; // JSON形式のテーブルデータ

    public static ProjectTableDataDTO from(ProjectTableData tableData) {
        if (tableData == null)
            return null;

        return ProjectTableDataDTO.builder()
                .id(tableData.getId())
                .tableDataJson(tableData.getTableDataJson())
                .build();
    }
}