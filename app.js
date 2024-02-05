let itemTypes = [],
    affixes = {},
    aspects = {};
document.addEventListener('alpine:init', () => {
    Alpine.data('d4data', () => ({
        itemTypes : itemTypes,
        affixes : affixes,
        aspects : aspects,
        showAffixes : true,
        showAspects : true,
        showContentFile : false,
        activeBuild : 0,
        activeItemTypeDropdown : -1,
        activeAffixDropdown : -1,
        activeAspectDropdown : -1,
        searchTextAspects : '',
        searchTextAffixes : '',
        myList : [],
        init() {
            this.fetchFiles();
            this.myList = this.getMyList();
        },
        fetchFiles() {
            fetch('./affixes.json').then((response) => response.json())
                .then((json) => this.affixes = json).catch((error) => console.error(error));
            fetch('./aspects.json').then((response) => response.json())
                .then((json) => this.aspects = json).catch((error) => console.error(error));
            fetch('./itemtypes.json').then((response) => response.json())
                .then((json) => this.itemTypes = json).catch((error) => console.error(error));
        },
        getMyList() {
            let myList = localStorage.getItem('myList');
            if (myList) {
                return JSON.parse(myList);
            }
            return this.defaultList();
        },
        saveList() {
            localStorage.setItem('myList', JSON.stringify(this.myList));
        },
        defaultList() {
            return [this.newBuild()];
        },
        searchListAffixes() {
            return Object.fromEntries(
                Object.entries(this.affixes).filter(([key, value]) => {
                    return value.toLowerCase().includes(this.searchTextAffixes.toLowerCase());
                })
            );
        },
        searchListAspects() {
            return Object.fromEntries(
                Object.entries(this.aspects).filter(([key, value]) => {
                    return value.desc.toLowerCase().includes(this.searchTextAspects.toLowerCase())
                        || key.toLowerCase().includes(this.searchTextAspects.toLowerCase());
                })
            );
        },
        resetDropdowns() {
            this.activeItemTypeDropdown = -1;
            this.activeAffixDropdown = -1;
            this.activeAspectDropdown = -1;
            this.resetTextSearch();
        },
        resetTextSearch() {
            this.searchTextAffixes = '';
            this.searchTextAspects = '';
        },
        newBuild() {
            return {
                id: new Date().getTime(),
                name : 'My Build ' + (this.myList.length + 1),
                aspects : [],
                affixes : []
            }
        },
        addBuild() {
            this.myList.push(this.newBuild());
            this.saveList();
        },
        removeBuild(key) {
            this.changeBuild(0);
            this.myList.splice(key, 1);
            this.saveList();
        },
        toggleValidatingBtn($el) {
            $el.parentElement.querySelectorAll('.btn')
                .forEach(el => el.classList.toggle('d-none'));
        },
        removeAllBuilds($el) {
            this.changeBuild(0);
            this.myList = this.defaultList();
            this.saveList();
            this.toggleValidatingBtn($el);
        },
        clearBuild($el) {
            let build = this.newBuild();
            build.name = this.myList[this.activeBuild].name;
            this.myList[this.activeBuild] = build;
            this.saveList();
            this.toggleValidatingBtn($el);
        },
        showDropdown(key, dropdownType) {
            if (this.$event.target.classList.contains('remove')) {
                return;
            }
            this[dropdownType] = key;
            this.$el.dataset['bsToggle'] = 'dropdown';
            this.$nextTick(() => {
                let dropdown = bootstrap.Dropdown.getOrCreateInstance(this.$el, {
                    autoClose : this.$el.dataset['dropdownClose'] ?? 'outside'
                }),
                    $this = this;
                dropdown.show();
                this.$el.parentElement.querySelector('.dropdown-menu input')?.focus();
                function removeEventListener() {
                    $this[dropdownType] = -1;
                    dropdown.dispose();
                    delete $this.$el.dataset['bsToggle'];
                    $this.resetTextSearch();
                    document.removeEventListener('hidden.bs.dropdown', removeEventListener);
                }
                this.$el.addEventListener('hidden.bs.dropdown', removeEventListener);
            });
        },
        buildNewItem() {
            return {
                id: new Date().getTime(),
                name : '',
                itemType : [],
                minPower : 780,
                affixPools : [],
                minAffixCount : 3
            }
        },
        changeBuild(key) {
            this.activeBuild = key;
            this.resetDropdowns();
        },
        removeItem(key) {
            this.myList[this.activeBuild].affixes.splice(key, 1);
            this.saveList();
        },
        addNewItem() {
            let newItem = this.buildNewItem();
            this.myList[this.activeBuild].affixes.push(newItem);
            this.saveList();
        },
        addAffix(key) {
            this.myList[this.activeBuild].affixes[key].affixPools.push({
                id: new Date().getTime(),
                affix: '',
                value: ''
            });
        },
        removeAffix(key, affixKey) {
            this.myList[this.activeBuild].affixes[key].affixPools.splice(affixKey, 1);
            this.saveList();
        },
        contentFile() {
            let content = '';
            if (this.myList[this.activeBuild].aspects.length) {
                content = "Aspects:\n";
                for (const item of this.myList[this.activeBuild].aspects) {
                    content += "  - [" + item.aspect + (item.value ? ', ' + item.value : '') + "]\n";
                }
                content += "\n";
            }
            if (this.myList[this.activeBuild].affixes.length) {
                content += "Affixes:\n";
                for (const item of this.myList[this.activeBuild].affixes) {
                    content += "  - " + item.name + ":\n";
                    content += "      itemType: [" + item.itemType.join(', ') + "]\n";
                    content += "      minPower: " + item.minPower + "\n";
                    content += "      affixPool:\n";
                    for (const affix of item.affixPools) {
                        content += "        - [" + affix.affix + (affix.value ? ', ' + affix.value : '') + "]\n";
                    }
                    content += "      minAffixCount: " + item.minAffixCount + "\n";
                    content += "\n";
                }
            }
            return content;
        },
        copyContentFile() {
            navigator.clipboard.writeText(this.contentFile());
        },
        addAspect(){
            this.myList[this.activeBuild].aspects.push({
                aspect: '',
                value: ''
            });
        },
        removeAspect(key) {
            this.myList[this.activeBuild].aspects.splice(key, 1);
            this.saveList();
        }
    }));
});
