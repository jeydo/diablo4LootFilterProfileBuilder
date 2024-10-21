document.addEventListener('alpine:init', () => {
    Alpine.data('d4data', () => ({
        itemTypes : {},
        affixes : {},
        uniques : {},
        showAffixes : true,
        showContentFile : false,
        showUniques : true,
        activeBuild : 0,
        currentObjForDropdown : null,
        searchTextAffixes : '',
        searchTextUniques : '',
        toastMessage : '',
        dropdownAffix : null,
        dropdownItemTypes : null,
        dropdownUniques : null,
        scraping : false,
        theme : 'auto',
        myList : [],
        init() {
            this.fetchFiles();
            this.myList = this.getMyList();
            this.dropdownAffix = document.getElementById('dropdownAffix');
            this.dropdownItemTypes = document.getElementById('dropdownItemTypes');
            this.dropdownUniques = document.getElementById('dropdownUniques');
            this.changeTheme(localStorage.getItem('theme') ?? 'auto');
        },
        fetchFiles() {
            fetch('./affixes.json').then((response) => response.json())
                .then((json) => this.affixes = json).catch((error) => console.error(error));
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
            this.searchTextUniques = '';
        },
        newBuild() {
            return {
                id: new Date().getTime(),
                name : 'My Build ' + (this.myList.length + 1),
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
            if (this.$event.target.classList.contains('remove') || this.$event.target.classList.contains('dropdown-item')) {
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
                minPower : 750,
                affixPools : [],
                minAffixCount : 2,
                minGreaterAffixCount : null
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
        downloadFile() {
            let blob = new Blob([this.contentFile()], {type: 'text/plain'}),
                url = window.URL.createObjectURL(blob),
                a = document.createElement('a');
            a.href = url;
            a.download = this.myList[this.activeBuild].name + '.yaml';
            a.click();
            window.URL.revokeObjectURL(url);
        },
        contentFile() {
            let content = '';
            if (this.myList[this.activeBuild].affixes.length) {
                content += "Affixes:\n";
                for (const item of this.myList[this.activeBuild].affixes) {
                    content += "  - " + item.name + ":\n";
                    content += "      itemType: [" + item.itemType.join(', ') + "]\n";
                    content += "      minPower: " + item.minPower + "\n";
                    content += "      affixPool:\n";
                    content += "        - count:\n";
                    for (const affix of item.affixPools) {
                        content += "            " + this.renderAffix(affix);
                    }
                    content += "          minCount: " + item.minAffixCount + "\n";
                    if (item.minGreaterAffixCount > 0) {
                        content += "          minGreaterAffixCount: " + item.minGreaterAffixCount + "\n";
                    }
                    content += "\n";
                }
            }

            if (this.myList[this.activeBuild].uniques.length) {
                content += "Uniques:\n";
                for (const item of this.myList[this.activeBuild].uniques) {
                    content += "  - aspect: [" + item.unique + (item.value ? ', ' + item.value : '') + "]\n";
                    content += "    minPower: " + item.minPower + "\n";
                    if (item.affixPools.length) {
                        content += "    affix:\n";
                        for (const affix of item.affixPools) {
                            content += "      " + this.renderAffix(affix);
                        }
                    }
                    if (item.minGreaterAffixCount > 0) {
                        content += "    minGreaterAffixCount: " + item.minGreaterAffixCount + "\n";
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
                    this.closeModal(this.$refs.modal);
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
        addUnique() {
            this.myList[this.activeBuild].uniques.push({
                id : new Date().getTime(),
                unique: '',
                value: '',
                minPower : 750,
                affixPools: [],
                minGreaterAffixCount : null
            });
        },
        scrapeBuild() {
            this.scraping = true;
            fetch(
                'https://api.diablo4lootfilter.jeydo.dev/scrapebuild',
                //'http://localhost:3000/scrapebuild',
                {
                    method:'POST',
                    headers: {
                      "Content-Type": "application/json",
                      "Accept": "application/json"
                    },
                    body: JSON.stringify({ url : this.$refs.scrapeBuild.value })
                }).then(response => {
                    if (response.ok)
                        return response.json()
                    throw response
                }).then(json => {
                    this.myList.push(json);
                    this.saveList();
                    this.closeModal(this.$refs.modalScrape);
                    this.$refs.scrapeBuild.value = '';
                    this.changeBuild(this.myList.length - 1);
                    this.showToast('Build added !');
                    this.scraping = false;
                }).catch(error => {
                    if (error instanceof Response) {
                        error.json().then(error => {
                            alert(error.error)
                        })
                    }
                    this.scraping = false;
                })
        },
        closeModal(ref) {
            const modal = bootstrap.Modal.getOrCreateInstance(ref);
            modal.hide();
        },
        changeTheme(theme) {
            this.theme = theme;
            if (theme === 'auto') {
                theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
            }
            document.documentElement.setAttribute('data-bs-theme', theme);
            localStorage.setItem('theme', this.theme);
        }
    }));
});
