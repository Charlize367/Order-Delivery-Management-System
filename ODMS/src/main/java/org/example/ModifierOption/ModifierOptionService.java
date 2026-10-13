package org.example.ModifierOption;

import jakarta.transaction.Transactional;
import org.example.Exception.ResourceNotFoundException;
import org.example.ModifierGroup.ModifierGroup;
import org.example.ModifierGroup.ModifierGroupRepository;
import org.example.ModifierGroup.ModifierGroupResponse;
import org.example.PageResponse;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ModifierOptionService {

    @Autowired
    private ModifierOptionRepository modifierOptionRepository;

    @Autowired
    private ModifierGroupRepository modifierGroupRepository;

    @Autowired
    private ModifierOptionMapper modifierOptionMapper;

    private static final Logger logger = LoggerFactory.getLogger(ModifierOptionService.class);

    @EventListener(ApplicationReadyEvent.class)
    @CacheEvict(value = {"modifierOptions", "modifierOption"}, allEntries = true)
    public void clearCacheOnStartup() {
        logger.info("Application Ready: Internal and External Caches have been nuked to sync with Database.");
    }


    public List<ModifierOptionResponse> getAllModifierOptions() {
        logger.info("Displaying all modifier options");

        return modifierOptionRepository.findAll().stream()
                .map(modifierOptionMapper::toResponse)
                .toList();
    }


    @Cacheable(value = "modifierOptions", key = "'page_'+#modifierGroupId+'_'+#pageable.pageNumber+'_'+#pageable.pageSize+'_'+#pageable.sort.toString()")
    public PageResponse<ModifierOptionResponse> getModifierOptions(Long modifierGroupId, Pageable pageable) {
        logger.info("Displaying modifier options by page for modifier group ID: {}", modifierGroupId);

        Page<ModifierOption> page = modifierOptionRepository
                .findByModifierGroupModifierGroupId(modifierGroupId, pageable);

        Page<ModifierOptionResponse> mapped = page.map(modifierOptionMapper::toResponse);

        return new PageResponse<>(mapped);
    }


    @Caching(
            put = {
                    @CachePut(value = "modifierOption", key = "#result.modifierOptionId")
            },
            evict = {
                    @CacheEvict(value = "modifierOptions", allEntries = true),
                    @CacheEvict(value = "modifierGroup", allEntries = true),
                    @CacheEvict(value = "modifierGroups", allEntries = true)
            }
    )
    public ModifierOptionResponse addModifierOption(Long modifierGroupId, ModifierOptionRequest request) {
        logger.info("Attempting to add new modifier option with name: {}", request.name());
        ModifierGroup modifierGroup = modifierGroupRepository.findById(modifierGroupId)
                .orElseThrow(() -> new ResourceNotFoundException("Modifier group not found with id: " + modifierGroupId));

        String safeName = Jsoup.clean(request.name(), Safelist.none()).trim();

        ModifierOption modifierOption = new ModifierOption(
                null,
                safeName,
                request.priceAdjustment(),
                modifierGroup,
                true
        );

        ModifierOption savedModifierOption = modifierOptionRepository.save(modifierOption);
        logger.info("Successfully added new modifier option with name: {}", request.name());
        return modifierOptionMapper.toResponse(savedModifierOption);
    }


    @Caching(
            put = {
                    @CachePut(value = "modifierOption", key = "#result.modifierOptionId")
            },
            evict = {
                    @CacheEvict(value = "modifierOptions", allEntries = true),
                    @CacheEvict(value = "modifierGroup", allEntries = true),
                    @CacheEvict(value = "modifierGroups", allEntries = true)
            }
    )
    public ModifierOptionResponse updateModifierOption(Long modifierOptionId, Long modifierGroupId, ModifierOptionRequest request) {
        try {
            logger.info("Updating modifier option with ID: {}", modifierOptionId);
            ModifierGroup modifierGroup = modifierGroupRepository.findById(modifierGroupId)
                    .orElseThrow(() -> new ResourceNotFoundException("Modifier group not found with id: " + modifierGroupId));

            String safeName = Jsoup.clean(request.name(), Safelist.none()).trim();

            ModifierOption modifierOption = modifierOptionRepository.findById(modifierOptionId)
                    .orElseThrow(() -> new ResourceNotFoundException("Modifier option not found with id: " + modifierOptionId));

            modifierOption.setModifierOptionId(modifierOptionId);
            modifierOption.setName(safeName);
            modifierOption.setPriceAdjustment(request.priceAdjustment());
            modifierOption.setModifierGroup(modifierGroup);

            ModifierOption savedModifierOption = modifierOptionRepository.save(modifierOption);
            logger.info("Successfully updated modifier option ID: {}", modifierOptionId);
            return modifierOptionMapper.toResponse(savedModifierOption);
        } catch (Exception e) {
            logger.warn("Error with modifier option ID: {}", modifierOptionId);
            throw new RuntimeException(e);
        }
    }


    @Caching(evict = {
            @CacheEvict(value = "modifierOption", key = "#modifierOptionId"),
            @CacheEvict(value = "modifierOptions", allEntries = true),
            @CacheEvict(value = "modifierGroup", allEntries = true),
            @CacheEvict(value = "modifierGroups", allEntries = true)
    })
    @Transactional
    public void deleteModifierOptionById(Long modifierOptionId) {

        logger.info("Deleting modifier option ID: {}", modifierOptionId);

        ModifierOption modifierOption = modifierOptionRepository.findById(modifierOptionId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Modifier option not found"));

        modifierOptionRepository.delete(modifierOption);

        logger.info("Successfully deleted modifier option ID: {}", modifierOptionId);
    }


    @Cacheable(value = "modifierOption", key = "#modifierOptionId")
    public ModifierOptionResponse getModifierOptionById(Long modifierOptionId) {
        logger.info("Getting modifier option ID: {}", modifierOptionId);
        ModifierOption modifierOption = modifierOptionRepository.findById(modifierOptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Modifier option not found."));
        logger.info("Successfully fetched modifier option ID: {}", modifierOptionId);
        return modifierOptionMapper.toResponse(modifierOption);
    }


    @Caching(
            put = {
                    @CachePut(value = "modifierOption", key = "#result.modifierOptionId")
            },
            evict = {
                    @CacheEvict(value = "modifierOptions", allEntries = true),
                    @CacheEvict(value = "modifierGroup", allEntries = true),
                    @CacheEvict(value = "modifierGroups", allEntries = true)
            }
    )
    public ModifierOptionResponse deactivateModifierOption(Long modifierOptionId) {
        logger.info("Deactivating modifier option with ID: {}", modifierOptionId);
        ModifierOption modifierOption = modifierOptionRepository.findById(modifierOptionId)
                .orElseThrow(() -> new ResourceNotFoundException("ModifierOption not found with id: " + modifierOptionId));

        modifierOption.setActive(false);

        ModifierOption savedModifierOption =  modifierOptionRepository.save(modifierOption);
        logger.info("Successfully deactivated promo with ID : {}", modifierOptionId);
        return modifierOptionMapper.toResponse(savedModifierOption);

    }


    @Caching(
            put = {
                    @CachePut(value = "modifierOption", key = "#result.modifierOptionId")
            },
            evict = {
                    @CacheEvict(value = "modifierOptions", allEntries = true),
                    @CacheEvict(value = "modifierGroup", allEntries = true),
                    @CacheEvict(value = "modifierGroups", allEntries = true)
            }
    )
    public ModifierOptionResponse activateModifierOption(Long modifierOptionId) {
        logger.info("Activating modifier option with ID: {}", modifierOptionId);
        ModifierOption modifierOption = modifierOptionRepository.findById(modifierOptionId)
                .orElseThrow(() -> new ResourceNotFoundException("ModifierOption not found with id: " + modifierOptionId));

        modifierOption.setActive(true);

        ModifierOption savedModifierOption =  modifierOptionRepository.save(modifierOption);
        logger.info("Successfully activated promo with ID : {}", modifierOptionId);
        return modifierOptionMapper.toResponse(savedModifierOption);

    }
}