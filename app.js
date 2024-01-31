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
        getMyList() {
            let myList = localStorage.getItem('myList');
            if (myList) {
                return JSON.parse(myList);
            }
            return this.defaultList();
        },
        defaultList() {
            return {
                affixes : [],
                aspects : []
            };
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
        removeItem(key) {
            this.myList.affixes.splice(key, 1);
            this.saveList();
        },
        clearItems() {
            this.myList = this.defaultList();
            this.saveList();
        },
        saveList() {
            localStorage.setItem('myList', JSON.stringify(this.myList));
        },
        addNewItem() {
            let newItem = this.buildNewItem();
            this.myList.affixes.push(newItem);
            this.saveList();
            this.triggerSlimSelect();
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
        addAffix(key) {
            this.myList.affixes[key].affixPools.push({
                affix: '',
                value: ''
            });
            this.triggerSlimSelect();
        },
        removeAffix(key, affixKey) {
            this.myList.affixes[key].affixPools.splice(affixKey, 1);
            this.saveList();
        },
        contentFile() {
            let content = '';
            if (this.myList.aspects.length) {
                content = "Aspects:\n";
                for (const item of this.myList.aspects) {
                    content += "  - [" + item.aspect + (item.value ? ', ' + item.value : '') + "]\n";
                }
                content += "\n";
            }
            if (this.myList.affixes.length) {
                content += "Affixes:\n";
                for (const item of this.myList.affixes) {
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
            this.myList.aspects.push({
                aspect: '',
                value: ''
            });
            this.triggerSlimSelect();
        },
        removeAspect(key) {
            this.myList.aspects.splice(key, 1);
            this.saveList();
        }
    }));
});
