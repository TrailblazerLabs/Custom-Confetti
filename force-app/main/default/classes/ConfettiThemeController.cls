public with sharing class ConfettiThemeController {

    private static final List<String> FALLBACK = new List<String>{ '#6236FF', '#FFFFFF' };

    @AuraEnabled(cacheable=true)
    public static List<String> getThemeColors(String developerName) {
        if (String.isBlank(developerName)) return FALLBACK;

        List<Confetti_Theme__mdt> themes = [
            SELECT Colour_1__c, Colour_2__c, Colour_3__c, Colour_4__c, Colour_5__c
            FROM Confetti_Theme__mdt
            WHERE DeveloperName = :developerName
            LIMIT 1
        ];

        if (themes.isEmpty()) return FALLBACK;

        Confetti_Theme__mdt t = themes[0];
        List<String> colors = new List<String>();
        for (String c : new List<String>{ t.Colour_1__c, t.Colour_2__c, t.Colour_3__c, t.Colour_4__c, t.Colour_5__c }) {
            if (String.isNotBlank(c)) colors.add(c);
        }

        return colors.isEmpty() ? FALLBACK : colors;
    }
}
