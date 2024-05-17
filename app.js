document.addEventListener('alpine:init', () => {
    Alpine.data('d4data', () => ({
        itemTypes : {},
        affixes : {},
        aspects : {},
        uniques : {},
        showAffixes : true,
        showAspects : true,
        showContentFile : false,
        showUniques : true,
        activeBuild : 0,
        currentObjForDropdown : null,
        searchTextAspects : '',
        searchTextAffixes : '',
        searchTextUniques : '',
        toastMessage : '',
        dropdownAffix : null,
        dropdownItemTypes : null,
        dropdownAspects : null,
        dropdownUniques : null,
        myList : [],
        init() {
            this.fetchFiles();
            this.myList = this.getMyList();
            this.dropdownAffix = document.getElementById('dropdownAffix');
            this.dropdownItemTypes = document.getElementById('dropdownItemTypes');
            this.dropdownAspects = document.getElementById('dropdownAspects');
            this.dropdownUniques = document.getElementById('dropdownUniques');
        },
        fetchFiles() {
            fetch('./affixes.json').then((response) => response.json())
                .then((json) => this.affixes = json).catch((error) => console.error(error));
            fetch('./aspects.json').then((response) => response.json())
                .then((json) => this.aspects = json).catch((error) => console.error(error));
            fetch('./itemtypes.json').then((response) => response.json())
                .then((json) => this.itemTypes = json).catch((error) => console.error(error));
            fetch('./uniques.json').then((response) => response.json())
                .then((json) => this.uniques = json).catch((error) => console.error(error));
        },
        getMyList() {
            let myList = localStorage.getItem('myList');
            if (myList) {
                myList = JSON.parse(myList);
                myList.forEach(item => {
                    item.uniques = item.uniques ?? [];
                });
                return myList;
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
        searchListUniques() {
            return Object.fromEntries(
                Object.entries(this.uniques).filter(([key, value]) => {
                    return value.desc.toLowerCase().includes(this.searchTextUniques.toLowerCase())
                        || key.toLowerCase().includes(this.searchTextUniques.toLowerCase());
                })
            );
        },
        resetDropdowns() {
            this.resetTextSearch();
        },
        resetTextSearch() {
            this.searchTextAffixes = '';
            this.searchTextAspects = '';
            this.searchTextUniques = '';
        },
        newBuild() {
            return {
                id: new Date().getTime(),
                name : 'My Build ' + (this.myList.length + 1),
                aspects : [],
                affixes : [],
                uniques : []
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
        showDropdown(obj, dropdown) {
            if (this.$event.target.classList.contains('remove')) {
                return;
            }
            this.currentObjForDropdown = obj;
            this.$event.target.parentElement.appendChild(dropdown);

            this.$el.dataset['bsToggle'] = 'dropdown';
            this.$nextTick(() => {

                let dropdown = bootstrap.Dropdown.getOrCreateInstance(this.$el, {
                    autoClose : this.$el.dataset['dropdownClose'] ?? 'outside'
                }),
                $this = this;
                dropdown.show();
                this.$el.parentElement.querySelector('.dropdown-menu input')?.focus();
                function removeEventListener() {
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
        removeItem(key, pool) {
            this.myList[this.activeBuild][pool].splice(key, 1);
            this.saveList();
        },
        addNewItem() {
            let newItem = this.buildNewItem();
            this.myList[this.activeBuild].affixes.push(newItem);
            this.saveList();
        },
        addAffix(key, pool) {
            this.myList[this.activeBuild][pool][key].affixPools.push({
                id: new Date().getTime(),
                affix: '',
                value: ''
            });
        },
        removeAffix(key, affixKey, pool) {
            this.myList[this.activeBuild][pool][key].affixPools.splice(affixKey, 1);
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
                    content += "        - count:\n";
                    for (const affix of item.affixPools) {
                        content += "          " + this.renderAffix(affix);
                    }
                    content += "          minCount: " + item.minAffixCount + "\n";
                    content += "\n";
                }
            }

            if (this.myList[this.activeBuild].uniques.length) {
                content += "Uniques:\n";
                for (const item of this.myList[this.activeBuild].uniques) {
                    content += "  - aspect: [" + item.unique + (item.value ? ', ' + item.value : '') + "]\n";
                    content += "    minPower: " + item.minPower + "\n";
                    if (item.affixPools.length) {
                        content += "    affixPools:\n";
                        for (const affix of item.affixPools) {
                            content += "      " + this.renderAffix(affix);
                        }
                    }
                    content += "\n";
                }
            }
            return content;
        },
        renderAffix(affix) {
            return "- [" + affix.affix + (affix.value ? ', ' + affix.value : '') + "]\n";
        },
        exportBuilds() {
            navigator.clipboard.writeText(JSON.stringify(this.myList));
            this.showToast('Export copied to clipboard');
        },
        showToast(message) {
            this.toastMessage = message;
            const toast = bootstrap.Toast.getOrCreateInstance(this.$refs.toast);
            toast.show({});
        },
        importBuilds() {
            let data = this.$refs.importContent.value;
            try {
                data = JSON.parse(data);
                if (Array.isArray(data)) {
                    this.myList = data;
                    this.saveList();
                    const modal = bootstrap.Modal.getOrCreateInstance(this.$refs.modal);
                    modal.hide();
                    this.$refs.importContent.value = '';
                    this.showToast('Builds imported');
                }
            } catch (e) {
                console.error(e);
            }
        },
        copyContentFile() {
            navigator.clipboard.writeText(this.contentFile());
        },
        addAspect(){
            this.myList[this.activeBuild].aspects.push({
                id : new Date().getTime(),
                aspect: '',
                value: ''
            });
        },
        removeAspect(key) {
            this.myList[this.activeBuild].aspects.splice(key, 1);
            this.saveList();
        },

        addUnique() {
            this.myList[this.activeBuild].uniques.push({
                id : new Date().getTime(),
                unique: '',
                value: '',
                minPower : 850,
                affixPools: []
            });
        }
    }));
});
