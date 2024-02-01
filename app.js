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
        myList : [],
        init() {
            this.fetchFiles();
            this.myList = this.getMyList();
            this.triggerSlimSelect();
        },
        fetchFiles() {
            fetch('./affixes.json').then((response) => response.json())
                .then((json) => this.affixes = json).catch((error) => console.error(error));
            fetch('./aspects.json').then((response) => response.json())
                .then((json) => this.aspects = json).catch((error) => console.error(error));
            fetch('./itemtypes.json').then((response) => response.json())
                .then((json) => this.itemTypes = json).catch((error) => console.error(error));
        },
        triggerSlimSelect() {
            this.$nextTick(() => {
                document.querySelectorAll('select').forEach((select) => {
                    if (select.classList.contains('slimselect')) {
                        return;
                    }
                    this.setSlimSelect(select, select.attributes.placeholder.value);
                });
            });
        },
        setSlimSelect(key, placeholder) {
            new SlimSelect({ select: key, settings: { placeholderText: placeholder }});
            key.classList.add('slimselect');
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
            this.triggerSlimSelect();
        },
        removeItem(key) {
            this.myList[this.activeBuild].affixes.splice(key, 1);
            this.saveList();
        },
        addNewItem() {
            let newItem = this.buildNewItem();
            this.myList[this.activeBuild].affixes.push(newItem);
            this.saveList();
            this.triggerSlimSelect();
        },
        addAffix(key) {
            this.myList[this.activeBuild].affixes[key].affixPools.push({
                id: new Date().getTime(),
                affix: '',
                value: ''
            });
            this.triggerSlimSelect();
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
            this.triggerSlimSelect();
        },
        removeAspect(key) {
            this.myList[this.activeBuild].aspects.splice(key, 1);
            this.saveList();
        }
    }));
});
