package org.example.ModifierGroup;

import jakarta.transaction.Transactional;
import org.example.Basket.Basket;
import org.example.Catalog.Catalog;
import org.example.Catalog.CatalogRepository;
import org.example.Exception.ResourceNotFoundException;
import org.example.ModifierOption.ModifierOption;
import org.example.ModifierOption.ModifierOptionRepository;
import org.example.ModifierOption.ModifierOptionRequest;
import org.example.PageResponse;
import org.example.PromoCode.PromoCode;
import org.example.PromoCode.PromoCodeResponse;
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

import java.util.ArrayList;
import java.util.List;

@Service
public class ModifierGroupService {

    @Autowired
    private ModifierGroupRepository modifierGroupRepository;


    @Autowired
    private ModifierOptionRepository modifierOptionRepository;

    @Autowired
    private CatalogRepository catalogRepository;

    @Autowired
    private ModifierGroupMapper modifierGroupMapper;

    private static final Logger logger = LoggerFactory.getLogger(ModifierGroupService.class);

    @EventListener(ApplicationReadyEvent.class)
    @CacheEvict(
            value = {
                    "modifierGroups",
                    "modifierGroup",
                    "modifierGroupsByCatalog"
            },
            allEntries = true
    )
    public void clearCacheOnStartup() {
        logger.info("Application Ready: Internal and External Caches have been nuked to sync with Database.");
    }


    public List<ModifierGroupResponse> getAllModifierGroups() {
        logger.info("Displaying all modifier groups");

        return modifierGroupRepository.findAll().stream()
                .map(modifierGroupMapper::toResponse)
                .toList();
    }


    @Cacheable(value = "modifierGroups", key = "'page_'+#pageable.pageNumber+'_'+#pageable.pageSize+'_'+#pageable.sort.toString()")
    public PageResponse<ModifierGroupResponse> getModifierGroups(Pageable pageable) {
        logger.info("Displaying modifier groups by page");

        Page<ModifierGroup> page = modifierGroupRepository
                .findAll(pageable);

        Page<ModifierGroupResponse> mapped = page.map(modifierGroupMapper::toResponse);

        return new PageResponse<>(mapped);
    }


    @Caching(
            put = {
                    @CachePut(value = "modifierGroup", key = "#result.modifierGroupId")
            },
            evict = {
                    @CacheEvict(value = "modifierGroups", allEntries = true),
                    @CacheEvict(value = "modifierGroupsByCatalog", allEntries = true)
            }
    )
    public ModifierGroupResponse addModifierGroup(Long catalogId, ModifierGroupRequest request) {
        logger.info("Attempting to add new modifier group with name: {}", request.name());
        Catalog catalog = catalogRepository.findById(catalogId)
                .orElseThrow(() -> new ResourceNotFoundException("Catalog not found with id: " + catalogId));

        String safeName = Jsoup.clean(request.name(), Safelist.none()).trim();


        ModifierGroup modifierGroup = new ModifierGroup(
                null,
                safeName,
                request.required(),
                request.minSelections(),
                request.maxSelections(),
                catalog,
                null,
                true
        );

        ModifierGroup savedModifierGroup = modifierGroupRepository.save(modifierGroup);

        List<ModifierOption> options = new ArrayList<>();
        for (ModifierOptionRequest option : request.modifierOptions()) {
            ModifierOption modifierOption = new ModifierOption();
            modifierOption.setName(option.name());
            modifierOption.setPriceAdjustment(option.priceAdjustment());
            modifierOption.setModifierGroup(savedModifierGroup);
            modifierOption.setActive(true);



            modifierOptionRepository.save(modifierOption);

            options.add(modifierOption);
        }


        savedModifierGroup.setModifierOptions(options);
        logger.info("Successfully added new modifier group with name: {}", request.name());
        return modifierGroupMapper.toResponse(savedModifierGroup);
    }


    @Caching(
            put = {
                    @CachePut(value = "modifierGroup", key = "#result.modifierGroupId")
            },
            evict = {
                    @CacheEvict(value = "modifierGroups", allEntries = true)
            }
    )
    public ModifierGroupResponse updateModifierGroup(Long modifierGroupId, Long catalogId, ModifierGroupRequest request) {
        try {
            logger.info("Updating modifier group with ID: {}", modifierGroupId);
            Catalog catalog = catalogRepository.findById(catalogId)
                    .orElseThrow(() -> new ResourceNotFoundException("Catalog not found with id: " + catalogId));

            String safeName = Jsoup.clean(request.name(), Safelist.none()).trim();

            ModifierGroup modifierGroup = modifierGroupRepository.findById(modifierGroupId)
                    .orElseThrow(() -> new ResourceNotFoundException("Modifier group not found with id: " + modifierGroupId));

            modifierGroup.setModifierGroupId(modifierGroupId);
            modifierGroup.setName(safeName);
            modifierGroup.setRequired(request.required());
            modifierGroup.setMinSelections(request.minSelections());
            modifierGroup.setMaxSelections(request.maxSelections());
            modifierGroup.setCatalog(catalog);

            ModifierGroup savedModifierGroup = modifierGroupRepository.save(modifierGroup);
            logger.info("Successfully updated modifier group ID: {}", modifierGroupId);
            return modifierGroupMapper.toResponse(savedModifierGroup);
        } catch (Exception e) {
            logger.warn("Error with modifier group ID: {}", modifierGroupId);
            throw new RuntimeException(e);
        }
    }


    @Caching(evict = {
            @CacheEvict(value = "modifierGroup", key = "#modifierGroupId"),
            @CacheEvict(value = "modifierGroups", allEntries = true)
    })
    @Transactional
    public void deleteModifierGroupById(Long modifierGroupId) {
        logger.info("Deleting modifier group ID: {}", modifierGroupId);
        ModifierGroup modifierGroup = modifierGroupRepository.findById(modifierGroupId)
                .orElseThrow(() -> new ResourceNotFoundException("Modifier group not found"));

        modifierGroup.setActive(false);

        modifierGroupRepository.save(modifierGroup);
        logger.info("Successfully deleted modifier group ID: {}", modifierGroupId);
    }


    @Cacheable(value = "modifierGroup", key = "#modifierGroupId")
    public ModifierGroupResponse getModifierGroupById(Long modifierGroupId) {
        logger.info("Getting modifier group ID: {}", modifierGroupId);
        ModifierGroup modifierGroup = modifierGroupRepository.findById(modifierGroupId)
                .orElseThrow(() -> new ResourceNotFoundException("Modifier group not found."));
        logger.info("Successfully fetched modifier group ID: {}", modifierGroupId);
        return modifierGroupMapper.toResponse(modifierGroup);
    }


    @Cacheable(value = "modifierGroupsByCatalog", key = "#catalogId")
    public List<ModifierGroupResponse> getModifierGroupsByCatalog(Long catalogId) {
        logger.info("Getting modifier group from Catalog ID: {}", catalogId);
        List<ModifierGroup> modifierGroup = modifierGroupRepository.getByCatalogCatalogId(catalogId);
        logger.info("Successfully fetched modifier group from catalog ID: {}", catalogId);
        return modifierGroupMapper.toListResponse(modifierGroup);
    }



    @Caching(
            put = {
                    @CachePut(value = "modifierGroup", key = "#result.modifierGroupId")
            },
            evict = {
                    @CacheEvict(value = "modifierGroups", allEntries = true)
            }
    )
    public ModifierGroupResponse deactivateModifierGroup(Long modifierGroupId) {
        logger.info("Activating modifier group with ID: {}", modifierGroupId);
        ModifierGroup modifierGroup = modifierGroupRepository.findById(modifierGroupId)
                .orElseThrow(() -> new ResourceNotFoundException("ModifierGroup not found with id: " + modifierGroupId));

        modifierGroup.setActive(false);

        ModifierGroup savedModifierGroup =  modifierGroupRepository.save(modifierGroup);
        logger.info("Successfully activated promo with ID : {}", modifierGroupId);
        return modifierGroupMapper.toResponse(savedModifierGroup);

    }


    @Caching(
            put = {
                    @CachePut(value = "modifierGroup", key = "#result.modifierGroupId")
            },
            evict = {
                    @CacheEvict(value = "modifierGroups", allEntries = true)
            }
    )
    public ModifierGroupResponse activateModifierGroup(Long modifierGroupId) {
        logger.info("Deactivating modifier group with ID: {}", modifierGroupId);
        ModifierGroup modifierGroup = modifierGroupRepository.findById(modifierGroupId)
                .orElseThrow(() -> new ResourceNotFoundException("ModifierGroup not found with id: " + modifierGroupId));

        modifierGroup.setActive(true);

        ModifierGroup savedModifierGroup =  modifierGroupRepository.save(modifierGroup);
        logger.info("Successfully deactivated promo with ID : {}", modifierGroupId);
        return modifierGroupMapper.toResponse(savedModifierGroup);

    }
}