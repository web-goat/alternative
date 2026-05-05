"use client";

import { useState } from "react";
import { TrumpLiarOverlay } from "@/components/TrumpLiarOverlay";
import { PoliticalBarometerSurvey } from "@/components/PoliticalBarometerSurvey";
import {CookieConsentLayer} from "@/components/CookieCosentLayer";

export function HomeClientLayer() {
    const [surveyEnabled, setSurveyEnabled] = useState(false);

    return (
        <>
            <TrumpLiarOverlay />
            <CookieConsentLayer onAccept={() => setSurveyEnabled(true)} />
            <PoliticalBarometerSurvey enabled={surveyEnabled} />
        </>
    );
}