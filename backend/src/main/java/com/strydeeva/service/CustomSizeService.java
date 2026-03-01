package com.strydeeva.service;

import com.strydeeva.dto.CustomSizeRequestDto;
import com.strydeeva.entity.CustomSize;
import com.strydeeva.repository.CustomSizeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomSizeService {

    private final CustomSizeRepository customSizeRepository;

    public CustomSizeService(CustomSizeRepository customSizeRepository) {
        this.customSizeRepository = customSizeRepository;
    }

    @Transactional
    public CustomSize create(CustomSizeRequestDto dto) {
        CustomSize entity = new CustomSize();
        entity.setBust(CustomSizeRequestDto.trim(dto.getBust()));
        entity.setWaist(CustomSizeRequestDto.trim(dto.getWaist()));
        entity.setHip(CustomSizeRequestDto.trim(dto.getHip()));
        entity.setShoulder(CustomSizeRequestDto.trim(dto.getShoulder()));
        entity.setArmhole(CustomSizeRequestDto.trim(dto.getArmhole()));
        entity.setSleeveLength(CustomSizeRequestDto.trim(dto.getSleeveLength()));
        entity.setSleeveRoundBicep(CustomSizeRequestDto.trim(dto.getSleeveRoundBicep()));
        entity.setHeight(CustomSizeRequestDto.trim(dto.getHeight()));
        return customSizeRepository.save(entity);
    }
}
