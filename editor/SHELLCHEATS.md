# Converting StoryQuest 2 link format for StoryQuest 3 link format

```
for i in *_de.txt; do cat $i | sed 's/\[l|\([^|]*\)|\([^|]*\)|true|true\]/{link(\1):\2}/g' > $i.temp; mv $i.temp $i; done
```

